import { NeumorphicButton } from "@/components/ui/NeumorphicButton";
import { NeumorphicCard } from "@/components/ui/NeumorphicCard";
import { NeumorphicInput } from "@/components/ui/NeumorphicInput";
import { THEME } from "@/constants/theme";
import { customerService } from "@/services/firestore";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import { Customer } from "@/types";
import { isValidPhoneNumber } from "@/utils/helpers";
import React, { useState } from "react";
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

interface AddCustomerScreenProps {
  onSuccess: () => void;
  onBack?: () => void;
  customer?: Customer;
  isEditing?: boolean;
}

export const AddCustomerScreen: React.FC<AddCustomerScreenProps> = ({
  onSuccess,
  onBack,
  customer,
  isEditing = false,
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { addCustomer, updateCustomerInStore } = useDataStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: customer?.name || "",
    phone: customer?.phone || "",
    address: customer?.address || "",
    email: customer?.email || "",
  });

  const handleSubmit = async () => {
    setError("");

    // Validation
    if (!form.name.trim()) {
      setError("Customer name is required");
      return;
    }

    if (!isValidPhoneNumber(form.phone)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);

    try {
      if (isEditing && customer) {
        // Update customer
        const updatedCustomerData = {
          name: form.name,
          phone: form.phone,
          address: form.address,
          email: form.email,
          updatedAt: new Date(),
        };

        await customerService.updateCustomer(customer.id, updatedCustomerData);

        updateCustomerInStore({
          ...customer,
          ...updatedCustomerData,
        });

        Alert.alert("Success", "Customer updated successfully");
      } else {
        // Create new customer
        const newCustomerData = {
          shopId: user?.shopId || "",
          name: form.name,
          phone: form.phone,
          address: form.address,
          email: form.email,
          balance: 0,
          status: "active" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const customerId = await customerService.createCustomer(newCustomerData);

        addCustomer({
          id: customerId,
          ...newCustomerData,
        });

        Alert.alert("Success", "Customer added successfully");
      }

      setForm({ name: "", phone: "", address: "", email: "" });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.title}>
            {isEditing ? "Edit Profile" : "New Customer"}
          </Text>
        </View>
        <Text style={styles.subtitle}>
          {isEditing
            ? "Update existing details for this client."
            : "Register a new client to your Khata digital ledger."}
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Form */}
          <View style={styles.form}>
            {error ? (
              <NeumorphicCard style={styles.errorBox} borderRadius={12} contentStyle={{ padding: 12 }}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </NeumorphicCard>
            ) : null}

            <View style={styles.formGroup}>
              <Text style={styles.label}>FULL NAME *</Text>
              <NeumorphicInput
                placeholder="e.g., Ramesh Kumar"
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>MOBILE NUMBER *</Text>
              <NeumorphicInput
                placeholder="9876543210"
                keyboardType="phone-pad"
                maxLength={10}
                value={form.phone}
                onChangeText={(text) =>
                  setForm({ ...form, phone: text.replace(/\D/g, "") })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>STREET ADDRESS (OPTIONAL)</Text>
              <NeumorphicInput
                placeholder="Full address for record"
                multiline
                numberOfLines={3}
                value={form.address}
                onChangeText={(text) => setForm({ ...form, address: text })}
                style={styles.multiline}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>EMAIL ADDRESS (OPTIONAL)</Text>
              <NeumorphicInput
                placeholder="customer@email.com"
                keyboardType="email-address"
                value={form.email}
                onChangeText={(text) => setForm({ ...form, email: text })}
              />
            </View>

            {/* Info Box */}
            <NeumorphicCard borderRadius={16} style={styles.infoBox} contentStyle={styles.infoContent}>
              <Text style={styles.infoIcon}>💡</Text>
              <Text style={styles.infoText}>
                Accurate details ensure seamless communication and trust between you and your customers.
              </Text>
            </NeumorphicCard>
          </View>

          {/* Button */}
          <View style={styles.buttonContainer}>
            <NeumorphicButton
              title={isEditing ? "SAVE CHANGES" : "REGISTER CUSTOMER"}
              onPress={handleSubmit}
              loading={loading}
              variant="primary"
            />
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
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  backIcon: {
    fontSize: 20,
    color: THEME.textMain,
    fontWeight: "900",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: THEME.textMain,
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.textMuted,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: 4,
  },
  form: {
    marginBottom: 32,
  },
  errorBox: {
    marginBottom: 20,
    borderColor: THEME.danger + "40",
    borderWidth: 1,
  },
  errorText: {
    color: THEME.danger,
    fontSize: 14,
    fontWeight: "700",
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.textMuted,
    marginBottom: 10,
    marginLeft: 6,
    letterSpacing: 1.5,
  },
  multiline: {
    minHeight: 100,
  },
  infoBox: {
    marginTop: 10,
  },
  infoContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  infoIcon: {
    fontSize: 22,
  },
  infoText: {
    fontSize: 13,
    color: THEME.textMain,
    flex: 1,
    fontWeight: "600",
    lineHeight: 18,
  },
  buttonContainer: {
    marginBottom: 40,
  },
});
