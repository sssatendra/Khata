import {
    signOut,
    updateProfile
} from "firebase/auth";
import { auth } from "../config/firebase";

export const authService = {
  /**
   * Send OTP to phone number
   * Returns RecaptchaVerifier for verifying OTP
   */
  async sendOTP(phoneNumber: string) {
    try {
      // Format phone number (ensure it has country code)
      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+91${phoneNumber}`;

      // This would typically use RecaptchaVerifier in production
      // For now, we'll implement a mock version that works with Expo
      console.log("OTP sent to:", formattedPhone);
      return { success: true, formattedPhone };
    } catch (error) {
      console.error("Error sending OTP:", error);
      throw error;
    }
  },

  /**
   * Verify OTP and sign in user
   */
  async verifyOTP(phoneNumber: string, otp: string) {
    try {
      // In production, this would use Firebase PhoneAuthProvider
      // For Expo, we need to implement a custom backend
      console.log("Verifying OTP for:", phoneNumber);
      return { success: true, phoneNumber };
    } catch (error) {
      console.error("Error verifying OTP:", error);
      throw error;
    }
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser() {
    return auth.currentUser;
  },

  /**
   * Sign out current user
   */
  async signOut() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  },

  /**
   * Update user profile
   */
  async updateUserProfile(displayName: string, photoURL?: string) {
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName,
          photoURL,
        });
        return { success: true };
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!auth.currentUser;
  },

  /**
   * Get user ID token
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
};
