import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { Loading } from "../../components/ui/StateIndicators";
import { useDashboardStats, useTransactionData } from "../../hooks/useData";
import { useAuthStore } from "../../store/authStore";
import { formatCurrency, formatDate } from "../../utils/helpers";

export default function AnalyticsTab() {
  const { user } = useAuthStore();
  const { stats, loading: statsLoading } = useDashboardStats(
    user?.shopId || "",
  );
  const { transactions, loading: transactionsLoading } = useTransactionData(
    user?.shopId || "",
  );

  if (statsLoading) {
    return <Loading message="Loading analytics..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Summary</Text>

          <View style={styles.cardGrid}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Total Outstanding</Text>
              <Text style={styles.cardValue}>
                {formatCurrency(stats?.totalOutstanding || 0)}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Total Customers</Text>
              <Text style={styles.cardValue}>{stats?.totalCustomers || 0}</Text>
            </View>

            <View style={[styles.card, styles.riskCard]}>
              <Text style={styles.riskCardLabel}>🔴 High Risk</Text>
              <Text style={styles.riskCardValue}>
                {stats?.highRiskCount || 0}
              </Text>
            </View>
          </View>
        </View>

        {/* Top Debtors */}
        {stats?.topDebtors && stats.topDebtors.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏆 Top Debtors</Text>

            {stats.topDebtors.map((customer, index) => (
              <View key={customer.id} style={styles.debtorItem}>
                <View style={styles.debtorRank}>
                  <Text style={styles.rankNumber}>{index + 1}</Text>
                </View>
                <View style={styles.debtorInfo}>
                  <Text style={styles.debtorName}>{customer.name}</Text>
                  <Text style={styles.debtorPhone}>{customer.phone}</Text>
                </View>
                <View style={styles.debtorAmount}>
                  <Text style={styles.amountValue}>
                    {formatCurrency(customer.balance)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Recent Transactions */}
        {stats?.recentTransactions && stats.recentTransactions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Recent Transactions</Text>

            {stats.recentTransactions.slice(0, 5).map((txn) => (
              <View key={txn.id} style={styles.transactionItem}>
                <View
                  style={[
                    styles.txnIcon,
                    {
                      backgroundColor:
                        txn.type === "credit" ? "#FEE2E2" : "#F0FDF4",
                    },
                  ]}
                >
                  <Text style={styles.icon}>
                    {txn.type === "credit" ? "➕" : "➖"}
                  </Text>
                </View>
                <View style={styles.txnInfo}>
                  <Text style={styles.txnType}>
                    {txn.type === "credit" ? "Udhar" : "Payment"}
                  </Text>
                  <Text style={styles.txnDate}>
                    {formatDate(txn.createdAt)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.txnAmount,
                    {
                      color: txn.type === "credit" ? "#DC2626" : "#10B981",
                    },
                  ]}
                >
                  {txn.type === "credit" ? "+" : "-"}
                  {formatCurrency(txn.amount)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Insights</Text>

          <View style={styles.insightBox}>
            <Text style={styles.insightIcon}>📌</Text>
            <Text style={styles.insightText}>
              {stats?.highRiskCount === 0
                ? "✅ No high-risk customers. Keep up the good work!"
                : `⚠️ You have ${stats?.highRiskCount} high-risk customers requiring attention.`}
            </Text>
          </View>

          {stats && stats.totalOutstanding > 0 && (
            <View style={styles.insightBox}>
              <Text style={styles.insightIcon}>💰</Text>
              <Text style={styles.insightText}>
                You have {formatCurrency(stats.totalOutstanding)} in pending
                dues from {stats.totalCustomers} customers.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  cardGrid: {
    gap: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  riskCard: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FEE2E2",
  },
  cardLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 8,
  },
  riskCardLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  riskCardValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#DC2626",
  },
  debtorItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  debtorRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  debtorInfo: {
    flex: 1,
  },
  debtorName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  debtorPhone: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  debtorAmount: {
    alignItems: "flex-end",
  },
  amountValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#DC2626",
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  txnIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 16,
  },
  txnInfo: {
    flex: 1,
  },
  txnType: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
  },
  txnDate: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
  txnAmount: {
    fontSize: 13,
    fontWeight: "700",
  },
  insightBox: {
    backgroundColor: "#DBEAFE",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#2563EB",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  insightIcon: {
    fontSize: 16,
    marginTop: 2,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    color: "#1E40AF",
    fontWeight: "500",
  },
});
