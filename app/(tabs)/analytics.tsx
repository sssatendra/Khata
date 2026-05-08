import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Loading } from "../../components/ui/StateIndicators";
import { AnalyticsCharts } from "../../components/AnalyticsCharts";
import {
  useCustomerData,
  useDashboardStats,
  useTransactionData,
} from "../../hooks/useData";
import { useAuthStore } from "../../store/authStore";
import { formatCurrency, formatDate } from "../../utils/helpers";
import { THEME } from "../../constants/theme";
import { NeumorphicCard } from "../../components/ui/NeumorphicCard";

export default function AnalyticsTab() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { stats, loading: statsLoading } = useDashboardStats(
    user?.shopId || "",
  );
  const { transactions, loading: transactionsLoading } = useTransactionData(
    user?.shopId || "",
  );
  const { customers, loading: customersLoading } = useCustomerData(
    user?.shopId || "",
  );

  if (statsLoading || customersLoading || transactionsLoading) {
    return <Loading message="Preparing insights..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Analytics</Text>

        {/* Charts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>BUSINESS PERFORMANCE</Text>
          <AnalyticsCharts customers={customers} transactions={transactions} />
        </View>

        {/* Top Debtors */}
        {stats?.topDebtors && stats.topDebtors.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>TOP DEBTORS</Text>

            {stats.topDebtors.map((customer, index) => (
              <NeumorphicCard
                key={customer.id}
                style={styles.debtorCard}
                borderRadius={16}
                contentStyle={styles.debtorContent}
              >
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <View style={styles.debtorInfo}>
                  <Text style={styles.debtorName}>{customer.name}</Text>
                  <Text style={styles.debtorPhone}>{customer.phone}</Text>
                </View>
                <View style={styles.debtorAmount}>
                  <Text style={styles.amountLabel}>OWES</Text>
                  <Text style={styles.amountValue}>
                    {formatCurrency(customer.balance)}
                  </Text>
                </View>
              </NeumorphicCard>
            ))}
          </View>
        )}

        {/* Recent Transactions */}
        {stats?.recentTransactions && stats.recentTransactions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>RECENT ACTIVITY</Text>

            {stats.recentTransactions.slice(0, 5).map((txn) => (
              <NeumorphicCard
                key={txn.id}
                style={styles.txnCard}
                borderRadius={12}
                contentStyle={styles.txnContent}
              >
                <View
                  style={[
                    styles.txnIcon,
                    {
                      backgroundColor:
                        txn.type === "credit"
                          ? THEME.danger + "20"
                          : THEME.success + "20",
                    },
                  ]}
                >
                  <Text style={styles.icon}>
                    {txn.type === "credit" ? "⬆" : "⬇"}
                  </Text>
                </View>
                <View style={styles.txnInfo}>
                  <Text style={styles.txnType}>
                    {txn.type === "credit" ? "DUE ADDED" : "PAYMENT"}
                  </Text>
                  <Text style={styles.txnDate}>{formatDate(txn.createdAt)}</Text>
                </View>
                <Text
                  style={[
                    styles.txnAmount,
                    {
                      color:
                        txn.type === "credit"
                          ? THEME.danger
                          : THEME.success,
                    },
                  ]}
                >
                  {txn.type === "credit" ? "+" : "-"}
                  {formatCurrency(txn.amount)}
                </Text>
              </NeumorphicCard>
            ))}
          </View>
        )}

        {/* Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>INSIGHTS & ACTIONABLE DATA</Text>

          <NeumorphicCard 
            borderRadius={20} 
            style={styles.insightCard}
            contentStyle={styles.insightBox}
          >
            <View style={[styles.insightIconBg, { backgroundColor: THEME.primary + "20" }]}>
              <Text style={styles.insightIconText}>💡</Text>
            </View>
            <View style={styles.insightTextContainer}>
              <Text style={styles.insightTitle}>Pro-Tip</Text>
              <Text style={styles.insightText}>
                {stats?.highRiskCount === 0
                  ? "Your collection health is excellent! No high-risk debtors detected currently."
                  : `Action Required: ${stats?.highRiskCount} customers have crossed the safe threshold.`}
              </Text>
            </View>
          </NeumorphicCard>

          {stats && stats.totalOutstanding > 0 && (
            <NeumorphicCard 
              borderRadius={20} 
              style={[styles.insightCard, { marginTop: 16 }]} 
              contentStyle={styles.insightBox}
            >
              <View style={[styles.insightIconBg, { backgroundColor: THEME.success + "20" }]}>
                <Text style={styles.insightIconText}>📈</Text>
              </View>
              <View style={styles.insightTextContainer}>
                <Text style={styles.insightTitle}>Recovery Potential</Text>
                <Text style={styles.insightText}>
                  Total recovery potential is {formatCurrency(stats.totalOutstanding)} across {stats.totalCustomers} active accounts.
                </Text>
              </View>
            </NeumorphicCard>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: THEME.textMain,
    marginVertical: 20,
    marginLeft: 4,
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: THEME.textMuted,
    marginBottom: 16,
    marginLeft: 4,
    letterSpacing: 2,
  },
  debtorCard: {
    marginBottom: 12,
  },
  debtorContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: THEME.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  rankText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
  },
  debtorInfo: {
    flex: 1,
  },
  debtorName: {
    fontSize: 17,
    fontWeight: "700",
    color: THEME.textMain,
  },
  debtorPhone: {
    fontSize: 13,
    color: THEME.textMuted,
    marginTop: 2,
  },
  debtorAmount: {
    alignItems: "flex-end",
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.textMuted,
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: "900",
    color: THEME.danger,
  },
  txnCard: {
    marginBottom: 10,
  },
  txnContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  txnIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 18,
    fontWeight: "900",
  },
  txnInfo: {
    flex: 1,
  },
  txnType: {
    fontSize: 13,
    fontWeight: "800",
    color: THEME.textMain,
  },
  txnDate: {
    fontSize: 11,
    color: THEME.textMuted,
    marginTop: 2,
  },
  txnAmount: {
    fontSize: 15,
    fontWeight: "900",
  },
  insightCard: {
    width: "100%",
  },
  insightBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12, // Reduced from 16 since Card already has 16
    paddingHorizontal: 0,
  },
  insightIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  insightIconText: {
    fontSize: 22,
  },
  insightTextContainer: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: THEME.textMain,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  insightText: {
    fontSize: 14,
    color: THEME.textMuted,
    fontWeight: "600",
    lineHeight: 20,
  },
});
