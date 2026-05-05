import React from "react";
import {
    Alert,
    FlatList,
    Linking,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { EmptyState, Loading } from "@/components/ui/StateIndicators";
import { useCustomerLedger } from "@/hooks/useData";
import { Customer } from "@/types";
import {
    formatCurrency,
    formatDate,
    generateWhatsAppLink,
    getDaysSince,
} from "@/utils/helpers";

interface CustomerDetailScreenProps {
  customer: Customer;
  onEditPress: () => void;
  onTransactionPress: () => void;
  onDeletePress: () => void;
}

export const CustomerDetailScreen: React.FC<CustomerDetailScreenProps> = ({
  customer,
  onEditPress,
  onTransactionPress,
  onDeletePress,
}) => {
  const { ledgerEntries, loading } = useCustomerLedger(customer.id);
  const daysSincePayment = getDaysSince(customer.lastTransactionDate);

  const handleWhatsAppMessage = () => {
    try {
      const link = generateWhatsAppLink(
        customer.phone,
        customer.balance,
        daysSincePayment,
      );
      Linking.openURL(link);
    } catch (error) {
      Alert.alert("Error", "Could not open WhatsApp");
    }
  };

  const getRiskLevel = () => {
    if (daysSincePayment > 30 || customer.balance > 10000) {
      return { level: "high", color: "#DC2626", icon: "🔴" };
    }
    if (daysSincePayment > 15 || customer.balance > 5000) {
      return { level: "medium", color: "#F59E0B", icon: "🟠" };
    }
    return { level: "low", color: "#10B981", icon: "🟢" };
  };

  const riskInfo = getRiskLevel();

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={ledgerEntries}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {/* Header Card */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text style={styles.customerName}>{customer.name}</Text>
                <Text style={styles.customerPhone}>{customer.phone}</Text>
              </View>
              <View
                style={[styles.riskBadge, { backgroundColor: riskInfo.color }]}
              >
                <Text style={styles.riskIcon}>{riskInfo.icon}</Text>
              </View>
            </View>

            {/* Balance Card */}
            <View
              style={[
                styles.balanceCard,
                customer.balance > 0
                  ? styles.balanceCardDebit
                  : styles.balanceCardCredit,
              ]}
            >
              <Text style={styles.balanceLabel}>
                {customer.balance > 0 ? "Total Udhar" : "You Owe (Advance)"}
              </Text>
              <Text
                style={[
                  styles.balanceAmount,
                  {
                    color: customer.balance > 0 ? "#DC2626" : "#10B981",
                  },
                ]}
              >
                {formatCurrency(customer.balance)}
              </Text>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Days Since Payment</Text>
                <Text style={styles.statValue}>{daysSincePayment}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Last Transaction</Text>
                <Text style={styles.statValue}>
                  {customer.lastTransactionDate
                    ? formatDate(customer.lastTransactionDate)
                    : "Never"}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onTransactionPress}
              >
                <Text style={styles.actionIcon}>➕</Text>
                <Text style={styles.actionText}>Add Transaction</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleWhatsAppMessage}
              >
                <Text style={styles.actionIcon}>💬</Text>
                <Text style={styles.actionText}>WhatsApp</Text>
              </TouchableOpacity>
            </View>

            {/* Ledger Header */}
            <View style={styles.ledgerHeader}>
              <Text style={styles.ledgerTitle}>Transaction History</Text>
              {ledgerEntries.length > 0 && (
                <Text style={styles.ledgerCount}>
                  {ledgerEntries.length} transactions
                </Text>
              )}
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.ledgerItem}>
            <View style={styles.ledgerItemLeft}>
              <View
                style={[
                  styles.transactionIcon,
                  {
                    backgroundColor:
                      item.type === "credit" ? "#FEE2E2" : "#F0FDF4",
                  },
                ]}
              >
                <Text style={styles.icon}>
                  {item.type === "credit" ? "➕" : "➖"}
                </Text>
              </View>
              <View style={styles.ledgerItemInfo}>
                <Text style={styles.ledgerItemType}>
                  {item.type === "credit" ? "Udhar (Purchase)" : "Payment"}
                </Text>
                {item.note && (
                  <Text style={styles.ledgerItemNote}>{item.note}</Text>
                )}
                <Text style={styles.ledgerItemDate}>
                  {formatDate(item.createdAt)}
                </Text>
              </View>
            </View>
            <View style={styles.ledgerItemRight}>
              <Text
                style={[
                  styles.ledgerItemAmount,
                  {
                    color: item.type === "credit" ? "#DC2626" : "#10B981",
                  },
                ]}
              >
                {item.type === "credit" ? "+" : "-"}
                {formatCurrency(item.amount)}
              </Text>
              <Text style={styles.ledgerItemBalance}>
                Bal: {formatCurrency(item.runningBalance)}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="📭"
              title="No Transactions"
              subtitle="Add a transaction to get started"
            />
          ) : null
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Footer Actions */}
      <View style={styles.footerActions}>
        <TouchableOpacity style={styles.footerButton} onPress={onEditPress}>
          <Text style={styles.footerButtonText}>✏️ Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footerButton, styles.deleteButton]}
          onPress={onDeletePress}
        >
          <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>

      {loading && <Loading message="Loading transactions..." />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerContent: {
    flex: 1,
  },
  customerName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: "#6B7280",
  },
  riskBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  riskIcon: {
    fontSize: 24,
  },
  balanceCard: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    padding: 16,
  },
  balanceCardDebit: {
    backgroundColor: "#FEE2E2",
  },
  balanceCardCredit: {
    backgroundColor: "#F0FDF4",
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "700",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  actionIcon: {
    fontSize: 16,
  },
  actionText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  ledgerHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ledgerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  ledgerCount: {
    fontSize: 12,
    color: "#6B7280",
  },
  listContent: {
    paddingBottom: 100,
  },
  ledgerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  ledgerItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 18,
  },
  ledgerItemInfo: {
    flex: 1,
  },
  ledgerItemType: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  ledgerItemNote: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  ledgerItemDate: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
  ledgerItemRight: {
    alignItems: "flex-end",
    minWidth: 80,
  },
  ledgerItemAmount: {
    fontSize: 14,
    fontWeight: "700",
  },
  ledgerItemBalance: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
  },
  footerActions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  footerButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  deleteButton: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FEE2E2",
  },
  footerButtonText: {
    fontWeight: "600",
    fontSize: 14,
    color: "#374151",
  },
  deleteButtonText: {
    fontWeight: "600",
    fontSize: 14,
    color: "#991B1B",
  },
});
