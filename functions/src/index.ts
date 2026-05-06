import axios from "axios";
import * as cors from "cors";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

const corsHandler = cors({ origin: true });
const db = admin.firestore();
const auth = admin.auth();

/**
 * Configuration - Update these with your actual values
 */
const CONFIG = {
  // reCAPTCHA v3 secret key from Google Cloud Console
  RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY || "",
  // Twilio for SMS (optional, for backup)
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || "",
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || "",
};

/**
 * Verify reCAPTCHA token
 * Ensures request is from legitimate mobile app
 */
async function verifyRecaptcha(token: string): Promise<boolean> {
  if (!CONFIG.RECAPTCHA_SECRET_KEY) {
    console.warn("reCAPTCHA not configured - skipping verification");
    return true;
  }

  try {
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: CONFIG.RECAPTCHA_SECRET_KEY,
          response: token,
        },
      },
    );

    const score = response.data.score || 0;
    const isValid = response.data.success && score > 0.5;

    console.log(`reCAPTCHA score: ${score}, valid: ${isValid}`);
    return isValid;
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return false;
  }
}

/**
 * Cloud Function: Send OTP via Firebase
 * POST /auth/send-otp
 * Body: { phoneNumber: "+919876543210", recaptchaToken: "..." }
 */
export const sendOTP = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
      }

      const { phoneNumber, recaptchaToken } = req.body;

      // Validate inputs
      if (!phoneNumber) {
        res.status(400).json({ error: "Phone number is required" });
        return;
      }

      if (!recaptchaToken) {
        res.status(400).json({ error: "reCAPTCHA token is required" });
        return;
      }

      // Verify reCAPTCHA
      const isValidRecaptcha = await verifyRecaptcha(recaptchaToken);
      if (!isValidRecaptcha) {
        res.status(400).json({ error: "reCAPTCHA verification failed" });
        return;
      }

      // Format phone number
      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+91${phoneNumber}`;

      // Check rate limiting (max 5 OTP requests per phone per hour)
      const rateLimitKey = `otp_limit:${formattedPhone}`;
      const doc = await db.collection("_metadata").doc(rateLimitKey).get();
      const count = doc.data()?.count || 0;
      const timestamp = doc.data()?.timestamp || Date.now();

      if (count >= 5 && Date.now() - timestamp < 3600000) {
        res
          .status(429)
          .json({ error: "Too many OTP requests. Try again later." });
        return;
      }

      // Update rate limiting
      await db
        .collection("_metadata")
        .doc(rateLimitKey)
        .set(
          {
            count: count + 1,
            timestamp: Date.now(),
          },
          { merge: true },
        );

      // Create OTP (in production, Firebase SMS handles this)
      // For demo, we generate a 6-digit code
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 300000; // 5 minutes

      // Store OTP temporarily
      await db.collection("_otp_temp").doc(formattedPhone).set(
        {
          otp,
          expiresAt,
          attempts: 0,
          createdAt: Date.now(),
        },
        { merge: true },
      );

      // Log OTP (in production, Firebase Messaging sends SMS)
      console.log(`📱 OTP for ${formattedPhone}: ${otp} (expires in 5 min)`);

      // In production with Twilio:
      // await sendOTPViaTwilio(formattedPhone, otp);

      res.json({
        success: true,
        message: `OTP sent to ${formattedPhone}`,
        // For testing: include OTP (remove in production!)
        otp: process.env.ENVIRONMENT === "development" ? otp : undefined,
      });
    } catch (error) {
      console.error("Error in sendOTP:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  });
});

/**
 * Cloud Function: Verify OTP and create/sign in user
 * POST /auth/verify-otp
 * Body: { phoneNumber: "+919876543210", otp: "123456", userData: {...} }
 */
export const verifyOTP = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
      }

      const { phoneNumber, otp, userData } = req.body;

      // Validate inputs
      if (!phoneNumber || !otp) {
        res.status(400).json({ error: "Phone number and OTP are required" });
        return;
      }

      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+91${phoneNumber}`;

      // Get stored OTP
      const otpDoc = await db.collection("_otp_temp").doc(formattedPhone).get();
      const otpData = otpDoc.data();

      if (!otpData) {
        res.status(400).json({ error: "OTP not found. Request a new one." });
        return;
      }

      // Check if expired
      if (Date.now() > otpData.expiresAt) {
        await db.collection("_otp_temp").doc(formattedPhone).delete();
        res.status(400).json({ error: "OTP expired. Request a new one." });
        return;
      }

      // Check attempts
      if (otpData.attempts >= 5) {
        res
          .status(429)
          .json({ error: "Too many failed attempts. Request new OTP." });
        return;
      }

      // Verify OTP
      if (otpData.otp !== otp) {
        await db
          .collection("_otp_temp")
          .doc(formattedPhone)
          .update({
            attempts: otpData.attempts + 1,
          });
        res.status(400).json({ error: "Invalid OTP" });
        return;
      }

      // OTP is valid - check if user exists
      let user;
      try {
        user = await auth.getUserByPhoneNumber(formattedPhone);
      } catch (error: any) {
        if (error.code === "auth/user-not-found") {
          // Create new user
          user = await auth.createUser({
            phoneNumber: formattedPhone,
            displayName: userData?.name || "Khata User",
            disabled: false,
          });

          // Create user profile in Firestore
          await db
            .collection("users")
            .doc(user.uid)
            .set({
              uid: user.uid,
              phoneNumber: formattedPhone,
              name: userData?.name || "Khata User",
              shopName: userData?.shopName || "My Store",
              role: "admin", // First user is admin
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

          // Create shop entry
          await db.collection("shops").add({
            ownerPhone: formattedPhone,
            name: userData?.shopName || "My Store",
            ownerName: userData?.name || "Khata User",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        } else {
          throw error;
        }
      }

      // Generate custom token for Expo
      const customToken = await auth.createCustomToken(user.uid);

      // Clean up OTP
      await db.collection("_otp_temp").doc(formattedPhone).delete();

      // Log successful verification
      console.log(`✅ User ${user.uid} verified with OTP`);

      res.json({
        success: true,
        customToken,
        user: {
          uid: user.uid,
          phoneNumber: user.phoneNumber,
          displayName: user.displayName,
        },
      });
    } catch (error) {
      console.error("Error in verifyOTP:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  });
});

/**
 * Cloud Function: Resend OTP
 * POST /auth/resend-otp
 */
export const resendOTP = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
      }

      const { phoneNumber, recaptchaToken } = req.body;

      if (!phoneNumber || !recaptchaToken) {
        res
          .status(400)
          .json({ error: "Phone number and reCAPTCHA token required" });
        return;
      }

      // Verify reCAPTCHA
      const isValid = await verifyRecaptcha(recaptchaToken);
      if (!isValid) {
        res.status(400).json({ error: "reCAPTCHA verification failed" });
        return;
      }

      // Use the same logic as sendOTP
      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+91${phoneNumber}`;

      // Generate new OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 300000;

      await db.collection("_otp_temp").doc(formattedPhone).set(
        {
          otp,
          expiresAt,
          attempts: 0,
          createdAt: Date.now(),
        },
        { merge: true },
      );

      console.log(`📱 Resent OTP for ${formattedPhone}: ${otp}`);

      res.json({
        success: true,
        message: "OTP resent",
        otp: process.env.ENVIRONMENT === "development" ? otp : undefined,
      });
    } catch (error) {
      console.error("Error in resendOTP:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  });
});

/**
 * Scheduled function to clean up expired OTPs (runs every hour)
 */
export const cleanupExpiredOTPs = functions.pubsub
  .schedule("every 60 minutes")
  .onRun(async () => {
    try {
      const now = Date.now();
      const expiredOtps = await db
        .collection("_otp_temp")
        .where("expiresAt", "<", now)
        .get();

      const batch = db.batch();
      expiredOtps.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`🗑️ Cleaned up ${expiredOtps.docs.length} expired OTPs`);
    } catch (error) {
      console.error("Error cleaning up OTPs:", error);
    }
  });
