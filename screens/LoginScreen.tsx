import { NeumorphicButton } from "@/components/ui/NeumorphicButton";
import { NeumorphicCard } from "@/components/ui/NeumorphicCard";
import { NeumorphicInput } from "@/components/ui/NeumorphicInput";
import { Loading } from "@/components/ui/StateIndicators";
import { THEME } from "@/constants/theme";
import { authService } from "@/services/auth";
import { useAuthStore } from "@/store/authStore";
import { formatPhoneNumber, isValidPhoneNumber } from "@/utils/helpers";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface LoginScreenProps {
  onSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shopName, setShopName] = useState("");
  const [userName, setUserName] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);

  const {
    setUser,
    setPhoneNumber: setStorePhone,
    persistAuth,
  } = useAuthStore();
  const insets = useSafeAreaInsets();

  // Countdown for resend OTP button
  useEffect(() => {
    let interval: any;
    if (resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCountdown]);

  /**
   * Generate or fetch reCAPTCHA token
   */
  const getReCaptchaToken = async (): Promise<string> => {
    try {
      const token = `recaptcha_${Date.now()}_${Math.random()}`;
      return token;
    } catch (error) {
      throw new Error("Failed to generate reCAPTCHA token");
    }
  };

  const handlePhoneSubmit = async () => {
    setError("");

    if (!isValidPhoneNumber(phoneNumber)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    try {
      const token = await getReCaptchaToken();
      setRecaptchaToken(token);

      const response = await authService.sendOTP(phoneNumber, token);

      if (!response.success) {
        throw new Error(response.error || "Failed to send OTP");
      }

      setStorePhone(phoneNumber);
      setResendCountdown(60); // 60 seconds before can resend
      setStep("otp");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to send OTP. Please try again.";
      setError(message);
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCountdown > 0) return;

    setError("");
    setLoading(true);
    try {
      const token = await getReCaptchaToken();
      const response = await authService.resendOTP(phoneNumber, token);

      if (!response.success) {
        throw new Error(response.error || "Failed to resend OTP");
      }

      setResendCountdown(60);
      Alert.alert("Success", "OTP resent to your phone");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to resend OTP";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async () => {
    setError("");

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    if (!shopName.trim()) {
      setError("Please enter shop name");
      return;
    }

    if (!userName.trim()) {
      setError("Please enter your name");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verifyOTP(phoneNumber, otp, {
        name: userName,
        shopName: shopName,
      });

      if (!response.success) {
        throw new Error(response.error || "Invalid OTP");
      }

      const currentUser = response.user || authService.getCurrentUser();
      if (currentUser) {
        const user = {
          id: currentUser.uid,
          phone: currentUser.phoneNumber || phoneNumber,
          name: userName,
          role: "admin" as const,
          shopId: "shop_" + Date.now(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        setUser(user);
        await persistAuth();
        onSuccess();
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Invalid OTP. Please try again.";
      setError(message);
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="AUTHENTICATING..." />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>KHATA</Text>
            <View style={styles.titleUnderline} />
            <Text style={styles.subtitle}>Premium Fintech Solutions</Text>
          </View>

          <NeumorphicCard style={styles.authCard} borderRadius={24} contentStyle={styles.cardContent}>
            <Text style={styles.cardTitle}>
              {step === "phone" ? "Secure Access" : "Identity Setup"}
            </Text>
            <Text style={styles.cardSubtitle}>
              {step === "phone"
                ? "Login with your phone to access your digital ledger."
                : `Verification code sent to +91 ${formatPhoneNumber(phoneNumber)}`}
            </Text>

            {step === "phone" ? (
              <View style={styles.form}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>MOBILE NUMBER</Text>
                  <NeumorphicInput
                    placeholder="98765 43210"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phoneNumber}
                    onChangeText={(text) => {
                      setPhoneNumber(text.replace(/\D/g, ""));
                      setError("");
                    }}
                  />
                </View>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <NeumorphicButton
                  title="REQUEST ACCESS"
                  onPress={handlePhoneSubmit}
                  disabled={!isValidPhoneNumber(phoneNumber)}
                  style={styles.actionButton}
                  variant="primary"
                />
              </View>
            ) : (
              <View style={styles.form}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>VERIFICATION CODE</Text>
                  <NeumorphicInput
                    placeholder="6-DIGIT OTP"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onChangeText={(text) => {
                      setOtp(text.replace(/\D/g, ""));
                      setError("");
                    }}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>SHOP / BUSINESS NAME</Text>
                  <NeumorphicInput
                    placeholder="e.g., Global Enterprises"
                    value={shopName}
                    onChangeText={setShopName}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>OWNER'S FULL NAME</Text>
                  <NeumorphicInput
                    placeholder="e.g., Alex Johnson"
                    value={userName}
                    onChangeText={setUserName}
                  />
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <NeumorphicButton
                  title="VERIFY & SECURE"
                  onPress={handleOTPSubmit}
                  disabled={otp.length !== 6 || !shopName || !userName}
                  style={styles.actionButton}
                  variant="primary"
                />

                <View style={styles.resendContainer}>
                  {resendCountdown > 0 ? (
                    <Text style={styles.resendText}>
                      Resend code in <Text style={{ color: THEME.primary, fontWeight: "800" }}>{resendCountdown}s</Text>
                    </Text>
                  ) : (
                    <TouchableOpacity onPress={handleResendOTP}>
                      <Text style={styles.resendLink}>RESEND CODE</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity onPress={() => setStep("phone")} style={{ marginTop: 20 }}>
                    <Text style={styles.changePhoneText}>Use a different number</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </NeumorphicCard>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              ENCRYPTED • SECURE • CLOUD-SYNC
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  title: {
    fontSize: 48,
    fontWeight: "900",
    color: THEME.primary,
    letterSpacing: 6,
  },
  titleUnderline: {
    width: 60,
    height: 4,
    backgroundColor: THEME.secondary,
    marginTop: -4,
    borderRadius: 2,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.textMuted,
    marginTop: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  authCard: {
    marginBottom: 20,
  },
  cardContent: {
    padding: 24,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: THEME.textMain,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 15,
    color: THEME.textMuted,
    marginBottom: 32,
    lineHeight: 22,
    fontWeight: "500",
  },
  form: {
    width: "100%",
  },
  inputWrapper: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.textMuted,
    marginBottom: 10,
    marginLeft: 4,
    letterSpacing: 1.5,
  },
  actionButton: {
    marginTop: 10,
  },
  resendContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  resendText: {
    fontSize: 14,
    color: THEME.textMuted,
    fontWeight: "600",
  },
  resendLink: {
    fontSize: 14,
    color: THEME.primary,
    fontWeight: "800",
    letterSpacing: 1,
  },
  changePhoneText: {
    fontSize: 13,
    color: THEME.textMuted,
    fontWeight: "600",
    opacity: 0.8,
  },
  errorText: {
    color: THEME.danger,
    fontSize: 13,
    marginBottom: 16,
    marginLeft: 4,
    fontWeight: "700",
  },
  footer: {
    marginTop: 48,
    alignItems: "center",
  },
  footerText: {
    fontSize: 11,
    color: THEME.textMuted,
    fontWeight: "800",
    letterSpacing: 3,
    opacity: 0.6,
  },
});
