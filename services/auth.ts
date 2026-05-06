import {
  signInWithCustomToken,
  signOut,
  updateProfile,
  User
} from "firebase/auth";
import { auth } from "../config/firebase";

/**
 * Backend service URL - Use your Cloud Functions or backend service
 * This should handle:
 * 1. reCAPTCHA verification
 * 2. OTP sending via Firebase
 * 3. User creation/profile updates
 */
const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "https://your-backend.com/api";

interface SendOTPResponse {
  success: boolean;
  verificationId?: string;
  formattedPhone: string;
  error?: string;
}

interface VerifyOTPResponse {
  success: boolean;
  customToken?: string;
  user?: User;
  error?: string;
}

export const authService = {
  /**
   * Send OTP via backend (handles reCAPTCHA)
   * Backend should validate phone, trigger Firebase OTP sending
   */
  async sendOTP(
    phoneNumber: string,
    recaptchaToken: string,
  ): Promise<SendOTPResponse> {
    try {
      // Format phone number with country code
      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+91${phoneNumber}`;

      // Call backend to send OTP
      // Backend handles:
      // 1. reCAPTCHA verification
      // 2. Rate limiting check
      // 3. Firebase signInWithPhoneNumber
      const response = await fetch(`${BACKEND_URL}/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
          recaptchaToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      // Store verification ID for later use
      localStorage?.setItem(
        "firebase_verification_id",
        data.verificationId || "",
      );

      return {
        success: true,
        verificationId: data.verificationId,
        formattedPhone,
      };
    } catch (error) {
      console.error("Error sending OTP:", error);
      return {
        success: false,
        formattedPhone: phoneNumber,
        error: error instanceof Error ? error.message : "Failed to send OTP",
      };
    }
  },

  /**
   * Verify OTP and sign in user
   * Calls backend with OTP code, backend exchanges for custom token
   */
  async verifyOTP(
    phoneNumber: string,
    otp: string,
    userData?: { name: string; shopName: string },
  ): Promise<VerifyOTPResponse> {
    try {
      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+91${phoneNumber}`;

      // Call backend to verify OTP
      // Backend handles:
      // 1. Firebase verification
      // 2. User creation if new
      // 3. Custom token generation
      const response = await fetch(`${BACKEND_URL}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
          otp,
          userData: userData || {},
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify OTP");
      }

      // Sign in with custom token from backend
      if (data.customToken) {
        await signInWithCustomToken(auth, data.customToken);
      }

      // Clear verification ID
      localStorage?.removeItem("firebase_verification_id");

      return {
        success: true,
        customToken: data.customToken,
        user: auth.currentUser || undefined,
      };
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to verify OTP",
      };
    }
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  /**
   * Sign out current user
   */
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error("Error signing out:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to sign out",
      };
    }
  },

  /**
   * Update user profile (name, avatar, etc)
   */
  async updateUserProfile(
    displayName: string,
    photoURL?: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName,
          photoURL,
        });
        return { success: true };
      }
      return { success: false, error: "No authenticated user" };
    } catch (error) {
      console.error("Error updating profile:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update profile",
      };
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!auth.currentUser;
  },

  /**
   * Get user ID token for API requests
   */
  async getIdToken(): Promise<string> {
    try {
      if (auth.currentUser) {
        return await auth.currentUser.getIdToken();
      }
      return "";
    } catch (error) {
      console.error("Error getting ID token:", error);
      throw error;
    }
  },

  /**
   * Resend OTP (for Expo, calls backend)
   */
  async resendOTP(
    phoneNumber: string,
    recaptchaToken: string,
  ): Promise<SendOTPResponse> {
    try {
      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+91${phoneNumber}`;

      const response = await fetch(`${BACKEND_URL}/auth/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
          recaptchaToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend OTP");
      }

      return {
        success: true,
        verificationId: data.verificationId,
        formattedPhone,
      };
    } catch (error) {
      console.error("Error resending OTP:", error);
      return {
        success: false,
        formattedPhone: phoneNumber,
        error: error instanceof Error ? error.message : "Failed to resend OTP",
      };
    }
  },
};
