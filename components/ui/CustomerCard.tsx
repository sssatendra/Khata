import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Customer } from "../../types";
import {
    formatCurrency,
    getDaysSince
} from "../../utils/helpers";

interface CustomerCardProps {
  customer: Customer;
  onPress: () => void;
  showRiskLevel?: boolean;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  onPress,
  showRiskLevel = true,
}) => {
  const daysSincePayment = useMemo(
    () => getDaysSince(customer.lastTransactionDate),
    [customer.lastTransactionDate],
  );

  const getRiskLevelInfo = () => {
    if (daysSincePayment > 30 || customer.balance > 10000) {
      return { level: "high", color: "#DC2626", icon: "🔴" };
    }
    if (daysSincePayment > 15 || customer.balance > 5000) {
      return { level: "medium", color: "#F59E0B", icon: "🟠" };
    }
    return { level: "low", color: "#10B981", icon: "🟢" };
  };

  const riskInfo = getRiskLevelInfo();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.nameSection}>
          <Text style={styles.name}>{customer.name}</Text>
          <Text style={styles.phone}>{customer.phone}</Text>
        </View>
        {showRiskLevel && (
          <View style={[styles.riskBadge, { backgroundColor: riskInfo.color }]}>
            <Text style={styles.riskText}>{riskInfo.icon}</Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <View>
          <Text style={styles.label}>Balance</Text>
          <Text
            style={[
              styles.balance,
              { color: customer.balance > 0 ? "#DC2626" : "#10B981" },
            ]}
          >
            {formatCurrency(customer.balance)}
          </Text>
        </View>
        <View>
          <Text style={styles.label}>Days Since Payment</Text>
          <Text style={styles.days}>{daysSincePayment} days</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nameSection: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  phone: {
    fontSize: 13,
    color: "#6B7280",
  },
  riskBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  riskText: {
    fontSize: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
    fontWeight: "500",
  },
  balance: {
    fontSize: 14,
    fontWeight: "700",
  },
  days: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
});
