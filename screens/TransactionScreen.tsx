import React, { useState } from "react";
import {
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Button } from "@/components/ui/Button";
import { transactionService } from "@/services/firestore";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import { Customer, TransactionType } from "@/types";
import { formatCurrency } from "@/utils/helpers";

interface TransactionScreenProps {
  customer: Customer;
  onSuccess: () => void;
}

export const TransactionScreen: React.FC<TransactionScreenProps> = ({
  customer,
  onSuccess,
}) => {
  const { user } = useAuthStore();
  const { addTransactionToStore, updateCustomerInStore } = useDataStore();
  const [transactionType, setTransactionType] =
    useState<TransactionType>("credit");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTypeModal, setShowTypeModal] = useState(false);

  const handleAmountChange = (text: string) => {
    setAmount(text.replace(/[^0-9]/g, ""));
  };

  const handleSubmit = async () => {
    setError("");

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setLoading(true);

    try {
      const txnAmount = parseFloat(amount);

      // Create transaction
      const transactionId = await transactionService.createTransaction({
        customerId: customer.id,
        shopId: user?.shopId || "",
        type: transactionType,
        amount: txnAmount,
        note: note || undefined,
      });

      // Calculate new balance
      const newBalance =
        transactionType === "credit"
          ? customer.balance + txnAmount
          : customer.balance - txnAmount;

      // Update customer balance
      const updatedCustomer: Customer = {
        ...customer,
        balance: newBalance,
        lastTransactionDate: new Date(),
        updatedAt: new Date(),
      };

      updateCustomerInStore(updatedCustomer);

      // Add to store
      addTransactionToStore({
        id: transactionId,
        customerId: customer.id,
        shopId: user?.shopId || "",
        type: transactionType,
        amount: txnAmount,
        note: note || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      Alert.alert(
        "Success",
        `Transaction of ${formatCurrency(txnAmount)} added successfully`,
      );

      // Reset form
      setAmount("");
      setNote("");
      setTransactionType("credit");
      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add transaction",
      );
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: TransactionType) => {
    return type === "credit" ? "#DC2626" : "#10B981";
  };

  const getTypeIcon = (type: TransactionType) => {
    return type === "credit" ? "➕" : "➖";
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Add Transaction</Text>
          <Text style={styles.subtitle}>for {customer.name}</Text>
        </View>

        {/* Customer Info Card */}
        <View style={styles.customerCard}>
          <Text style={styles.customerName}>{customer.name}</Text>
          <Text style={styles.currentBalance}>
            Current Balance:{" "}
            <Text style={styles.balance}>
              {formatCurrency(customer.balance)}
            </Text>
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Transaction Type */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Transaction Type</Text>
            <TouchableOpacity
              style={styles.typeSelector}
              onPress={() => setShowTypeModal(true)}
            >
              <View
                style={[
                  styles.typeButton,
                  { backgroundColor: getTypeColor(transactionType) },
                ]}
              >
                <Text style={styles.typeIcon}>
                  {getTypeIcon(transactionType)}
                </Text>
              </View>
              <View style={styles.typeInfo}>
                <Text style={styles.typeLabel}>
                  {transactionType === "credit"
                    ? "Udhar (Purchase)"
                    : "Payment"}
                </Text>
                <Text style={styles.typeDescription}>
                  {transactionType === "credit"
                    ? "Customer owes you money"
                    : "Customer paid you money"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Amount */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Amount *</Text>
            <View style={styles.amountWrapper}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                keyboardType="number-pad"
                value={amount}
                onChangeText={handleAmountChange}
              />
            </View>
            {amount && (
              <Text style={styles.amountPreview}>
                {formatCurrency(parseFloat(amount))}
              </Text>
            )}
          </View>

          {/* Note */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Note (Optional)</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="e.g., Purchased rice, dal, flour"
              multiline
              numberOfLines={3}
              value={note}
              onChangeText={setNote}
            />
          </View>

          {/* Preview */}
          <View style={styles.previewBox}>
            <Text style={styles.previewLabel}>After this transaction:</Text>
            <Text style={styles.previewValue}>
              Balance will be:{" "}
              <Text
                style={{
                  color: transactionType === "credit" ? "#DC2626" : "#10B981",
                }}
              >
                {formatCurrency(
                  transactionType === "credit"
                    ? customer.balance + parseFloat(amount || "0")
                    : customer.balance - parseFloat(amount || "0"),
                )}
              </Text>
            </Text>
          </View>
        </View>

        {/* Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Add Transaction"
            onPress={handleSubmit}
            disabled={!amount || parseFloat(amount) <= 0}
            size="large"
          />
        </View>
      </ScrollView>

      {/* Transaction Type Modal */}
      <Modal
        visible={showTypeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Transaction Type</Text>

            <TouchableOpacity
              style={[
                styles.typeOption,
                transactionType === "credit" && styles.typeOptionSelected,
              ]}
              onPress={() => {
                setTransactionType("credit");
                setShowTypeModal(false);
              }}
            >
              <Text style={styles.typeOptionIcon}>➕</Text>
              <View style={styles.typeOptionInfo}>
                <Text style={styles.typeOptionTitle}>Udhar (Credit)</Text>
                <Text style={styles.typeOptionDesc}>
                  Customer purchased on credit
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeOption,
                transactionType === "debit" && styles.typeOptionSelected,
              ]}
              onPress={() => {
                setTransactionType("debit");
                setShowTypeModal(false);
              }}
            >
              <Text style={styles.typeOptionIcon}>➖</Text>
              <View style={styles.typeOptionInfo}>
                <Text style={styles.typeOptionTitle}>Payment (Debit)</Text>
                <Text style={styles.typeOptionDesc}>Customer paid you</Text>
              </View>
            </TouchableOpacity>

            <Button
              title="Close"
              onPress={() => setShowTypeModal(false)}
              variant="secondary"
            />
          </View>
        </View>
      </Modal>
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
  customerCard: {
    backgroundColor: "#DBEAFE",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#2563EB",
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E40AF",
    marginBottom: 8,
  },
  currentBalance: {
    fontSize: 14,
    color: "#1E40AF",
  },
  balance: {
    fontWeight: "700",
    fontSize: 16,
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
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 10,
  },
  typeSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
  },
  typeButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  typeIcon: {
    fontSize: 24,
  },
  typeInfo: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  typeDescription: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  amountWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 12,
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  amountPreview: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
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
  previewBox: {
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  previewLabel: {
    fontSize: 12,
    color: "#15803D",
    fontWeight: "500",
    marginBottom: 4,
  },
  previewValue: {
    fontSize: 16,
    color: "#15803D",
    fontWeight: "600",
  },
  buttonContainer: {
    marginBottom: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 20,
  },
  typeOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  typeOptionSelected: {
    backgroundColor: "#DBEAFE",
    borderColor: "#2563EB",
  },
  typeOptionIcon: {
    fontSize: 28,
  },
  typeOptionInfo: {
    flex: 1,
  },
  typeOptionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  typeOptionDesc: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
});
