import * as functions from "firebase-functions";
/**
 * Cloud Function: Send OTP via Firebase
 * POST /auth/send-otp
 * Body: { phoneNumber: "+919876543210", recaptchaToken: "..." }
 */
export declare const sendOTP: functions.https.HttpsFunction;
/**
 * Cloud Function: Verify OTP and create/sign in user
 * POST /auth/verify-otp
 * Body: { phoneNumber: "+919876543210", otp: "123456", userData: {...} }
 */
export declare const verifyOTP: functions.https.HttpsFunction;
/**
 * Cloud Function: Resend OTP
 * POST /auth/resend-otp
 */
export declare const resendOTP: functions.https.HttpsFunction;
/**
 * Scheduled function to clean up expired OTPs (runs every hour)
 */
export declare const cleanupExpiredOTPs: functions.scheduler.ScheduleFunction;
