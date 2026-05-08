import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { THEME } from "@/constants/theme";
import { NeumorphicCard } from "@/components/ui/NeumorphicCard";
import { NeumorphicButton } from "@/components/ui/NeumorphicButton";
import { NeumorphicInput } from "@/components/ui/NeumorphicInput";
import { transactionService } from "@/services/firestore";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import { Customer, TransactionType } from "@/types";
import { formatCurrency, formatSimpleDate } from "@/utils/helpers";

interface TransactionScreenProps {
  customer: Customer;
  onSuccess: () => void;
  onBack?: () => void;
}

export const TransactionScreen: React.FC<TransactionScreenProps> = ({
  customer,
  onSuccess,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { addTransactionToStore, updateCustomerInStore } = useDataStore();
  const [transactionType, setTransactionType] =
    useState<TransactionType>("credit");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTypeModal, setShowTypeModal] = useState(false);

  const handleAmountChange = (text: string) => {
    setAmount(text.replace(/[^0-9]/g, ""));
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
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
        lastTransactionDate: date,
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
        createdAt: date,
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
    return type === "credit" ? THEME.danger : THEME.success;
  };

  const getTypeIcon = (type: TransactionType) => {
    return type === "credit" ? "↑" : "↓";
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.title}>New Record</Text>
          <Text style={styles.subtitle}>Adding ledger for {customer.name}</Text>
        </View>

        {/* Customer Info Card */}
        <NeumorphicCard borderRadius={20} style={styles.customerCard} contentStyle={styles.customerCardContent}>
          <View style={styles.customerHeader}>
            <Text style={styles.customerName}>{customer.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: customer.balance > 0 ? THEME.danger + "20" : THEME.success + "20" }]}>
              <Text style={[styles.statusText, { color: customer.balance > 0 ? THEME.danger : THEME.success }]}>
                {customer.balance > 0 ? "OWES YOU" : "SETTLED"}
              </Text>
            </View>
          </View>
          <Text style={styles.balanceLabel}>Current Debt</Text>
          <Text style={[styles.balanceValue, { color: customer.balance > 0 ? THEME.danger : THEME.success }]}>
            {formatCurrency(Math.abs(customer.balance))}
          </Text>
        </NeumorphicCard>

        {/* Form */}
        <View style={styles.form}>
          {error ? (
            <NeumorphicCard style={styles.errorBox} borderRadius={12} contentStyle={{ padding: 12 }}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </NeumorphicCard>
          ) : null}

          {/* Transaction Type */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>TRANSACTION TYPE</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowTypeModal(true)}
            >
              <NeumorphicCard borderRadius={16} style={styles.typeSelector} contentStyle={styles.typeSelectorContent}>
                <View
                  style={[
                    styles.typeButton,
                    { backgroundColor: getTypeColor(transactionType) + "20" },
                  ]}
                >
                  <Text style={[styles.typeIcon, { color: getTypeColor(transactionType) }]}>
                    {getTypeIcon(transactionType)}
                  </Text>
                </View>
                <View style={styles.typeInfo}>
                  <Text style={styles.typeLabel}>
                    {transactionType === "credit"
                      ? "Give Credit (Udhar)"
                      : "Receive Payment"}
                  </Text>
                  <Text style={styles.typeDescription}>
                    {transactionType === "credit"
                      ? "Customer purchased items on debt"
                      : "Customer cleared their existing debt"}
                  </Text>
                </View>
                <Text style={styles.chevron}>↓</Text>
              </NeumorphicCard>
            </TouchableOpacity>
          </View>

          {/* Amount */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>ENTER AMOUNT</Text>
            <NeumorphicInput
              placeholder="₹ 0"
              keyboardType="number-pad"
              value={amount}
              onChangeText={handleAmountChange}
              style={styles.amountInput}
            />
          </View>

          {/* Transaction Date */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>TRANSACTION DATE</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowDatePicker(true)}
            >
              <NeumorphicCard borderRadius={16} style={styles.dateSelector} contentStyle={styles.dateSelectorContent}>
                <Text style={styles.dateIcon}>📅</Text>
                <Text style={styles.dateText}>{formatSimpleDate(date)}</Text>
                <Text style={styles.dateHint}>Tap to change</Text>
              </NeumorphicCard>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          {/* Note */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>NOTES (OPTIONAL)</Text>
            <NeumorphicInput
              placeholder="Items purchased or payment mode..."
              multiline
              numberOfLines={3}
              value={note}
              onChangeText={setNote}
              style={styles.multiline}
            />
          </View>

          {/* Preview */}
          <NeumorphicCard borderRadius={16} style={styles.previewBox} contentStyle={styles.previewContent}>
            <Text style={styles.previewLabel}>NEW ESTIMATED BALANCE</Text>
            <Text
              style={[styles.previewValue, {
                color: (transactionType === "credit" 
                  ? customer.balance + parseFloat(amount || "0")
                  : customer.balance - parseFloat(amount || "0")) > 0 
                  ? THEME.danger 
                  : THEME.success,
              }]}
            >
              {formatCurrency(
                Math.abs(transactionType === "credit"
                  ? customer.balance + parseFloat(amount || "0")
                  : customer.balance - parseFloat(amount || "0")),
              )}
              <Text style={styles.previewSub}>
                {(transactionType === "credit" 
                  ? customer.balance + parseFloat(amount || "0")
                  : customer.balance - parseFloat(amount || "0")) > 0 
                  ? " (Owed)" 
                  : " (Advance)"}
              </Text>
            </Text>
          </NeumorphicCard>
        </View>

        {/* Button */}
        <View style={styles.buttonContainer}>
          <NeumorphicButton
            title="CONFIRM TRANSACTION"
            onPress={handleSubmit}
            disabled={!amount || parseFloat(amount) <= 0}
            loading={loading}
            variant="primary"
          />
        </View>
      </ScrollView>

      {/* Transaction Type Modal */}
      <Modal
        visible={showTypeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <NeumorphicCard borderRadius={24} style={styles.modalContent} contentStyle={styles.modalInner}>
            <Text style={styles.modalTitle}>Select Action</Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setTransactionType("credit");
                setShowTypeModal(false);
              }}
              style={styles.optionWrapper}
            >
              <NeumorphicCard
                borderRadius={16}
                style={[styles.typeOption, transactionType === "credit" && styles.activeOption]}
                contentStyle={styles.optionContent}
              >
                <View style={[styles.optionIconBox, { backgroundColor: THEME.danger + "20" }]}>
                  <Text style={[styles.typeOptionIcon, { color: THEME.danger }]}>↑</Text>
                </View>
                <View style={styles.typeOptionInfo}>
                  <Text style={styles.typeOptionTitle}>Give Credit</Text>
                  <Text style={styles.typeOptionDesc}>Add to customer's debt</Text>
                </View>
              </NeumorphicCard>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setTransactionType("debit");
                setShowTypeModal(false);
              }}
              style={styles.optionWrapper}
            >
              <NeumorphicCard
                borderRadius={16}
                style={[styles.typeOption, transactionType === "debit" && styles.activeOption]}
                contentStyle={styles.optionContent}
              >
                <View style={[styles.optionIconBox, { backgroundColor: THEME.success + "20" }]}>
                  <Text style={[styles.typeOptionIcon, { color: THEME.success }]}>↓</Text>
                </View>
                <View style={styles.typeOptionInfo}>
                  <Text style={styles.typeOptionTitle}>Receive Payment</Text>
                  <Text style={styles.typeOptionDesc}>Clear customer's debt</Text>
                </View>
              </NeumorphicCard>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setShowTypeModal(false)}
              style={styles.closeModal}
            >
              <Text style={styles.closeModalText}>CANCEL</Text>
            </TouchableOpacity>
          </NeumorphicCard>
        </View>
      </Modal>
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
    paddingLeft: 4,
  },
  backButton: {
    marginBottom: 16,
    marginLeft: -4,
    padding: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.primary,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: THEME.textMain,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: THEME.textMuted,
    fontWeight: "600",
  },
  customerCard: {
    marginBottom: 32,
  },
  customerCardContent: {
    padding: 20,
  },
  customerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  customerName: {
    fontSize: 22,
    fontWeight: "900",
    color: THEME.textMain,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  balanceLabel: {
    fontSize: 12,
    color: THEME.textMuted,
    fontWeight: "700",
    letterSpacing: 1,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: "900",
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
    marginBottom: 12,
    marginLeft: 6,
    letterSpacing: 1.5,
  },
  typeSelector: {
    borderColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
  },
  typeSelectorContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  typeButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  typeIcon: {
    fontSize: 24,
    fontWeight: "900",
  },
  typeInfo: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.textMain,
  },
  typeDescription: {
    fontSize: 12,
    color: THEME.textMuted,
    marginTop: 2,
    fontWeight: "600",
  },
  chevron: {
    fontSize: 16,
    color: THEME.textMuted,
    fontWeight: "900",
  },
  amountInput: {
    fontSize: 36,
    fontWeight: "900",
    height: 80,
    color: THEME.primary,
  },
  dateSelector: {
    borderColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
  },
  dateSelectorContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  dateIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  dateText: {
    fontSize: 16,
    color: THEME.textMain,
    fontWeight: "800",
  },
  dateHint: {
    fontSize: 13,
    color: THEME.textMuted,
    flex: 1,
    textAlign: "right",
    fontWeight: "600",
  },
  multiline: {
    minHeight: 100,
  },
  previewBox: {
    marginTop: 8,
    backgroundColor: THEME.surface + "40",
  },
  previewContent: {
    padding: 16,
  },
  previewLabel: {
    fontSize: 10,
    color: THEME.textMuted,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  previewValue: {
    fontSize: 20,
    fontWeight: "900",
  },
  previewSub: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.textMuted,
  },
  buttonContainer: {
    marginBottom: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
  },
  modalInner: {
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: THEME.textMain,
    marginBottom: 24,
    textAlign: "center",
    letterSpacing: 1,
  },
  optionWrapper: {
    marginBottom: 16,
  },
  typeOption: {
    borderColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
  },
  activeOption: {
    borderColor: THEME.primary + "40",
    backgroundColor: THEME.primary + "05",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  optionIconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  typeOptionIcon: {
    fontSize: 26,
    fontWeight: "900",
  },
  typeOptionInfo: {
    flex: 1,
  },
  typeOptionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: THEME.textMain,
  },
  typeOptionDesc: {
    fontSize: 13,
    color: THEME.textMuted,
    marginTop: 2,
    fontWeight: "600",
  },
  closeModal: {
    marginTop: 12,
    alignItems: "center",
    padding: 12,
  },
  closeModalText: {
    fontSize: 13,
    color: THEME.textMuted,
    fontWeight: "800",
    letterSpacing: 2,
  },
});
