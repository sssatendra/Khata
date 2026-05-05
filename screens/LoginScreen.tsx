import React, { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/StateIndicators";
import { useAuthStore } from "@/store/authStore";
import { formatPhoneNumber, isValidPhoneNumber } from "@/utils/helpers";

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

  const {
    setUser,
    setPhoneNumber: setStorePhone,
    persistAuth,
  } = useAuthStore();

  const handlePhoneSubmit = async () => {
    setError("");

    if (!isValidPhoneNumber(phoneNumber)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    try {
      // Simulate OTP sending
      // In production, integrate with Firebase Phone Auth
      console.log("OTP sent to:", phoneNumber);
      setStorePhone(phoneNumber);
      setStep("otp");
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
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
      // Simulate OTP verification
      // In production, verify with Firebase
      const mockUser = {
        id: "user_" + Date.now(),
        phone: phoneNumber,
        name: userName,
        role: "admin" as const,
        shopId: "shop_" + Date.now(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setUser(mockUser);
      await persistAuth();
      onSuccess();
    } catch (err) {
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Processing..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>📱</Text>
          <Text style={styles.title}>Khata App</Text>
          <Text style={styles.subtitle}>
            Digital Udhar Ledger for Kirana Stores
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {step === "phone" ? (
            <>
              <Text style={styles.stepTitle}>Enter Your Phone Number</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.phoneInputWrapper}>
                  <Text style={styles.countryCode}>+91</Text>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="9876543210"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phoneNumber}
                    onChangeText={(text) => {
                      setPhoneNumber(text.replace(/\D/g, ""));
                      setError("");
                    }}
                  />
                </View>
                {phoneNumber && (
                  <Text style={styles.formattedPhone}>
                    Formatted: {formatPhoneNumber(phoneNumber)}
                  </Text>
                )}
              </View>

              {error && <Text style={styles.error}>{error}</Text>}

              <Button
                title="Send OTP"
                onPress={handlePhoneSubmit}
                disabled={!isValidPhoneNumber(phoneNumber)}
              />
            </>
          ) : (
            <>
              <Text style={styles.stepTitle}>Verify OTP & Setup Shop</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>OTP (6 digits)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="000000"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={(text) => {
                    setOtp(text.replace(/\D/g, ""));
                    setError("");
                  }}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Shop Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your Kirana Store Name"
                  value={shopName}
                  onChangeText={(text) => {
                    setShopName(text);
                    setError("");
                  }}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Your Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  value={userName}
                  onChangeText={(text) => {
                    setUserName(text);
                    setError("");
                  }}
                />
              </View>

              {error && <Text style={styles.error}>{error}</Text>}

              <Button
                title="Verify & Continue"
                onPress={handleOTPSubmit}
                disabled={otp.length !== 6}
              />

              <TouchableOpacity onPress={() => setStep("phone")}>
                <Text style={styles.changePhone}>Change Phone Number</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>🔒 Secure & Private</Text>
          <Text style={styles.infoText}>
            Your data is encrypted and stored securely.
          </Text>
          <Text style={styles.infoText}>
            No third party has access to your ledger.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  logo: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  phoneInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginRight: 4,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  formattedPhone: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  error: {
    color: "#DC2626",
    fontSize: 14,
    marginBottom: 12,
    fontWeight: "500",
  },
  changePhone: {
    color: "#2563EB",
    fontSize: 14,
    textAlign: "center",
    marginTop: 16,
    fontWeight: "600",
  },
  infoBox: {
    backgroundColor: "#DBEAFE",
    borderLeftWidth: 4,
    borderLeftColor: "#2563EB",
    borderRadius: 8,
    padding: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E40AF",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#1E40AF",
    marginBottom: 4,
  },
});
