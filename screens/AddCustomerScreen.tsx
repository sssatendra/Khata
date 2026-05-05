import React, { useState } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import { Button } from "@/components/ui/Button";
import { customerService } from "@/services/firestore";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import { Customer } from "@/types";
import { isValidPhoneNumber } from "@/utils/helpers";

interface AddCustomerScreenProps {
  onSuccess: () => void;
  customer?: Customer;
  isEditing?: boolean;
}

export const AddCustomerScreen: React.FC<AddCustomerScreenProps> = ({
  onSuccess,
  customer,
  isEditing = false,
}) => {
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
        await customerService.updateCustomer(customer.id, {
          name: form.name,
          phone: form.phone,
          address: form.address,
          email: form.email,
          updatedAt: new Date(),
        });

        updateCustomerInStore({
          ...customer,
          name: form.name,
          phone: form.phone,
          address: form.address,
          email: form.email,
          updatedAt: new Date(),
        });

        Alert.alert("Success", "Customer updated successfully");
      } else {
        // Create new customer
        const customerId = await customerService.createCustomer({
          shopId: user?.shopId || "",
          name: form.name,
          phone: form.phone,
          address: form.address,
          email: form.email,
          balance: 0,
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        addCustomer({
          id: customerId,
          shopId: user?.shopId || "",
          name: form.name,
          phone: form.phone,
          address: form.address,
          email: form.email,
          balance: 0,
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
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
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {isEditing ? "Edit Customer" : "Add New Customer"}
          </Text>
          <Text style={styles.subtitle}>
            {isEditing
              ? "Update customer details"
              : "Add a new customer to your shop"}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Customer Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Ramesh Kumar"
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <View style={styles.phoneWrapper}>
              <Text style={styles.prefix}>+91</Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="9876543210"
                keyboardType="phone-pad"
                maxLength={10}
                value={form.phone}
                onChangeText={(text) =>
                  setForm({ ...form, phone: text.replace(/\D/g, "") })
                }
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Address (Optional)</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Street address"
              multiline
              numberOfLines={3}
              value={form.address}
              onChangeText={(text) => setForm({ ...form, address: text })}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="customer@example.com"
              keyboardType="email-address"
              value={form.email}
              onChangeText={(text) => setForm({ ...form, email: text })}
            />
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              Customer details can be updated anytime. Phone number is used for
              searching and WhatsApp messages.
            </Text>
          </View>
        </View>

        {/* Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={isEditing ? "Update Customer" : "Add Customer"}
            onPress={handleSubmit}
            loading={loading}
            size="large"
          />
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
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  form: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 24,
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderLeftWidth: 4,
    borderLeftColor: "#DC2626",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#991B1B",
    fontSize: 14,
    fontWeight: "500",
  },
  formGroup: {
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
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  phoneWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  prefix: {
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
  infoBox: {
    backgroundColor: "#DBEAFE",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    gap: 12,
  },
  infoIcon: {
    fontSize: 18,
  },
  infoText: {
    fontSize: 12,
    color: "#1E40AF",
    flex: 1,
  },
  buttonContainer: {
    marginBottom: 24,
  },
});
