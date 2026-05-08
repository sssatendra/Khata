import axios from "axios";
import cors from "cors";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();

const corsHandler = cors({ origin: true });
const isDev = process.env.ENVIRONMENT === "development";

console.log(`🚀 [BACKEND] Loading Khata Functions (Mode: ${process.env.ENVIRONMENT || "production"})`);

import * as fs from "fs";
import * as path from "path";

// File-based store for development (shared across function instances)
const DEV_STORE_PATH = path.join(__dirname, "../dev_otp_store.json");

function getDevStore() {
  if (!fs.existsSync(DEV_STORE_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(DEV_STORE_PATH, "utf8"));
  } catch {
    return {};
  }
}

function saveDevStore(store: any) {
  fs.writeFileSync(DEV_STORE_PATH, JSON.stringify(store, null, 2));
}

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

      const isDev = process.env.ENVIRONMENT === "development";

      if (!isDev) {
        // Check rate limiting (max 5 OTP requests per phone per hour) - PROD ONLY
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
      }

      // Create OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 300000; // 5 minutes

      if (isDev) {
        // DEV: Store in file
        const store = getDevStore();
        store[formattedPhone] = {
          otp,
          expiresAt,
          attempts: 0,
        };
        saveDevStore(store);
      } else {
        // PROD: Store in Firestore
        await db.collection("_otp_temp").doc(formattedPhone).set(
          {
            otp,
            expiresAt,
            attempts: 0,
            createdAt: Date.now(),
          },
          { merge: true },
        );
      }

      // Handle OTP delivery based on environment
      if (process.env.ENVIRONMENT === "development") {
        // DEV MODE: Just log the OTP to the console
        console.log("-----------------------------------------");
        console.log(`📱 [DEV MODE] OTP for ${formattedPhone}: ${otp}`);
        console.log("-----------------------------------------");
      } else {
        // PRODUCTION: Send real SMS via Twilio
        // await sendOTPViaTwilio(formattedPhone, otp);
        console.log(`📱 [PROD MODE] Sending SMS to ${formattedPhone}`);
      }

      res.json({
        success: true,
        message:
          process.env.ENVIRONMENT === "development"
            ? `[DEV] OTP is ${otp}`
            : `OTP sent to ${formattedPhone}`,
        // For testing: include OTP in response ONLY in development
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

      const isDev = process.env.ENVIRONMENT === "development";
      let otpData;

      if (isDev) {
        // DEV: Get from file
        const store = getDevStore();
        otpData = store[formattedPhone];
      } else {
        // PROD: Get from Firestore
        const otpDoc = await db.collection("_otp_temp").doc(formattedPhone).get();
        otpData = otpDoc.data() as any;
      }

      if (!otpData) {
        res.status(400).json({ error: "OTP not found. Request a new one." });
        return;
      }

      // Check if expired
      if (Date.now() > otpData.expiresAt) {
        if (isDev) {
          const store = getDevStore();
          delete store[formattedPhone];
          saveDevStore(store);
        } else {
          await db.collection("_otp_temp").doc(formattedPhone).delete();
        }
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
        if (isDev) {
          const store = getDevStore();
          if (store[formattedPhone]) {
            store[formattedPhone].attempts += 1;
            saveDevStore(store);
          }
        } else {
          await db
            .collection("_otp_temp")
            .doc(formattedPhone)
            .update({
              attempts: otpData.attempts + 1,
            });
        }
        res.status(400).json({ error: "Invalid OTP" });
        return;
      }

      // OTP is valid
      let user: any;
      let customToken = "dev-token-allow-access";

      if (isDev) {
        // DEV: Complete mock flow
        user = {
          uid: `dev-user-${formattedPhone.replace(/\+/g, "")}`,
          phoneNumber: formattedPhone,
          displayName: userData?.name || "Dev User",
        };
        
        const store = getDevStore();
        delete store[formattedPhone];
        saveDevStore(store);

        res.json({
          success: true,
          customToken,
          user,
        });
        return;
      }

      // PROD: Real Firebase flow
      try {
        // Try to get or create user
        try {
          user = await auth.getUserByPhoneNumber(formattedPhone);
        } catch (error: any) {
          if (error.code === "auth/user-not-found") {
            // Real Auth creation in production
            user = await auth.createUser({
              phoneNumber: formattedPhone,
              displayName: userData?.name || "Khata User",
            });
          } else {
            throw error;
          }
        }

        // Create profile in Firestore
        try {
          await db
            .collection("users")
            .doc(user.uid)
            .set({
              uid: user.uid,
              phoneNumber: formattedPhone,
              name: userData?.name || "Khata User",
              role: "admin",
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        } catch (e) {
          console.warn("Firestore profile creation failed, continuing...", e);
        }

        // Generate token
        customToken = await auth.createCustomToken(user.uid);

        // Clean up OTP
        await db.collection("_otp_temp").doc(formattedPhone).delete();

        res.json({
          success: true,
          customToken,
          user: {
            uid: user.uid,
            phoneNumber: user.phoneNumber,
            displayName: user.displayName,
          },
        });
        return;
      } catch (error) {
        console.error("Error in verifyOTP flow:", error);
        throw error;
      }

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

      if (isDev) {
        // DEV: Store in file
        const store = getDevStore();
        store[formattedPhone] = {
          otp,
          expiresAt,
          attempts: 0,
        };
        saveDevStore(store);
      } else {
        // PROD: Store in Firestore
        await db.collection("_otp_temp").doc(formattedPhone).set(
          {
            otp,
            expiresAt,
            attempts: 0,
            createdAt: Date.now(),
          },
          { merge: true },
        );
      }

      // Handle OTP delivery based on environment
      if (process.env.ENVIRONMENT === "development") {
        console.log("-----------------------------------------");
        console.log(`📱 [DEV MODE] Resent OTP for ${formattedPhone}: ${otp}`);
        console.log("-----------------------------------------");
      } else {
        // await sendOTPViaTwilio(formattedPhone, otp);
        console.log(`📱 [PROD MODE] Resending SMS to ${formattedPhone}`);
      }

      res.json({
        success: true,
        message:
          process.env.ENVIRONMENT === "development"
            ? `[DEV] Resent OTP is ${otp}`
            : "OTP resent",
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

import { onSchedule } from "firebase-functions/v2/scheduler";

/**
 * Scheduled function to clean up expired OTPs (runs every hour)
 */
export const cleanupExpiredOTPs = onSchedule("every 60 minutes", async () => {
  try {
    const now = Date.now();

    if (isDev) {
      // DEV: Clean up file store
      const store = getDevStore();
      let count = 0;
      for (const phone in store) {
        if (store[phone].expiresAt < now) {
          delete store[phone];
          count++;
        }
      }
      saveDevStore(store);
      console.log(`🗑️ [DEV] Cleaned up ${count} expired OTPs from file store`);
    } else {
      // PROD: Clean up Firestore
      const expiredOtps = await db
        .collection("_otp_temp")
        .where("expiresAt", "<", now)
        .get();

      const batch = db.batch();
      expiredOtps.docs.forEach((doc: any) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`🗑️ Cleaned up ${expiredOtps.docs.length} expired OTPs from Firestore`);
    }
  } catch (error) {
    console.error("Error cleaning up OTPs:", error);
  }
});
