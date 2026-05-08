import React, { useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { THEME } from "@/constants/theme";
import { NeumorphicCard } from "@/components/ui/NeumorphicCard";
import { NeumorphicButton } from "@/components/ui/NeumorphicButton";
import { SearchBar } from "@/components/ui/SearchBar";
import { EmptyState, Loading } from "@/components/ui/StateIndicators";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import {
  useCustomerData,
  useCustomerSearch,
  useDashboardStats,
} from "@/hooks/useData";
import { formatCurrency } from "@/utils/helpers";
import { Customer } from "@/types";

interface DashboardScreenProps {
  onNavigateToCustomers: () => void;
  onNavigateToAddCustomer: () => void;
  onNavigateToCustomerDetail: (customer: Customer) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigateToCustomers,
  onNavigateToAddCustomer,
  onNavigateToCustomerDetail,
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { stats: dashboardStats, loading: statsLoading } = useDashboardStats(
    user?.shopId || "",
  );
  const { customers } = useCustomerData(user?.shopId || "");
  const { searchResults, handleSearch, searchQuery } = useCustomerSearch(
    user?.shopId || "",
  );
  const [filterRiskLevel, setFilterRiskLevel] = useState<
    "all" | "high" | "medium" | "low"
  >("all");
  const { getRiskLevel } = useDataStore();

  const filteredCustomers = useMemo(() => {
    let filtered = searchQuery ? searchResults : customers;

    if (filterRiskLevel !== "all") {
      filtered = filtered.filter((c) => getRiskLevel(c) === filterRiskLevel);
    }

    return filtered.sort((a, b) => b.balance - a.balance).slice(0, 10);
  }, [customers, searchResults, searchQuery, filterRiskLevel, getRiskLevel]);

  const getRiskColor = (level: "low" | "medium" | "high") => {
    switch (level) {
      case "high":
        return THEME.danger;
      case "medium":
        return THEME.warning;
      case "low":
        return THEME.success;
      default:
        return THEME.textMuted;
    }
  };

  const getRiskIcon = (level: "low" | "medium" | "high") => {
    switch (level) {
      case "high":
        return "⚠️";
      case "medium":
        return "⌛";
      case "low":
        return "✅";
      default:
        return "•";
    }
  };

  if (statsLoading) {
    return <Loading message="Loading dashboard..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={{ paddingTop: insets.top }}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Good Morning,</Text>
                <Text style={styles.userName}>{user?.name || "Store Owner"}</Text>
              </View>
              <NeumorphicCard borderRadius={32} style={styles.avatarCard} contentStyle={styles.avatarContent}>
                <Text style={styles.avatar}>👤</Text>
              </NeumorphicCard>
            </View>

            {/* Stats Overview */}
            <View style={styles.statsGrid}>
              <NeumorphicCard borderRadius={20} style={styles.statCard}>
                <Text style={styles.statLabel}>OUTSTANDING DUES</Text>
                <Text style={styles.statValue}>
                  {formatCurrency(dashboardStats?.totalOutstanding || 0)}
                </Text>
                <Text style={styles.statSubtext}>
                  from {dashboardStats?.totalCustomers || 0} customers
                </Text>
              </NeumorphicCard>

              <NeumorphicCard borderRadius={20} style={styles.statCard} contentStyle={styles.riskCardContent}>
                <View style={styles.riskAccent} />
                <View>
                  <Text style={[styles.statLabel, { color: THEME.danger }]}>HIGH RISK</Text>
                  <Text style={styles.riskValue}>
                    {dashboardStats?.highRiskCount || 0}
                  </Text>
                  <Text style={styles.statSubtext}>require follow-up</Text>
                </View>
              </NeumorphicCard>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <View style={{ flex: 1 }}>
                <NeumorphicButton
                  title="+ New Customer"
                  onPress={onNavigateToAddCustomer}
                  variant="primary"
                />
              </View>
              <View style={{ flex: 1 }}>
                <NeumorphicButton
                  title="All Customers"
                  onPress={onNavigateToCustomers}
                  variant="secondary"
                />
              </View>
            </View>

            {/* Search */}
            <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
              <SearchBar onSearch={handleSearch} />
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterTabs}>
              {(["all", "high", "medium", "low"] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  onPress={() => setFilterRiskLevel(level)}
                  style={{ flex: 1 }}
                >
                  <View
                    style={[
                      styles.filterTab,
                      filterRiskLevel === level && styles.filterTabActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterTabText,
                        filterRiskLevel === level && styles.filterTabTextActive,
                      ]}
                    >
                      {level === "all"
                        ? "All"
                        : level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {filteredCustomers.length > 0 && (
              <Text style={styles.listTitle}>
                TOP DEBTORS
              </Text>
            )}
          </View>
        }
        renderItem={({ item: customer }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onNavigateToCustomerDetail(customer)}
          >
            <NeumorphicCard style={styles.customerItem} borderRadius={16}>
              <View style={styles.customerInfo}>
                <View style={styles.customerHeader}>
                  <Text style={styles.customerName}>{customer.name}</Text>
                  <View
                    style={[
                      styles.riskBadge,
                      { backgroundColor: getRiskColor(getRiskLevel(customer)) + "20" },
                    ]}
                  >
                    <Text style={[styles.badgeText, { color: getRiskColor(getRiskLevel(customer)) }]}>
                      {getRiskIcon(getRiskLevel(customer))} {getRiskLevel(customer).toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.customerPhone}>{customer.phone}</Text>
              </View>

              <View style={styles.customerBalance}>
                <Text style={styles.balanceLabel}>BALANCE</Text>
                <Text
                  style={[
                    styles.balanceAmount,
                    { color: customer.balance > 0 ? THEME.danger : THEME.success },
                  ]}
                >
                  {formatCurrency(customer.balance)}
                </Text>
              </View>
            </NeumorphicCard>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="📭"
            title="No Customers Found"
            subtitle="Add your first customer to get started"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  greeting: {
    fontSize: 14,
    color: THEME.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  userName: {
    fontSize: 28,
    fontWeight: "900",
    color: THEME.textMain,
    marginTop: 4,
  },
  avatarCard: {
    width: 56,
    height: 56,
  },
  avatarContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
  },
  avatar: {
    fontSize: 24,
  },
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  statCard: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: THEME.textMuted,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "900",
    color: THEME.primary,
    marginBottom: 4,
  },
  riskValue: {
    fontSize: 22,
    fontWeight: "900",
    color: THEME.danger,
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 11,
    color: THEME.textMuted,
    fontWeight: "500",
  },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  filterTabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  filterTab: {
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  filterTabActive: {
    backgroundColor: THEME.primary + "15",
    borderColor: THEME.primary + "60",
    borderWidth: 1,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.textMuted,
    letterSpacing: 0.5,
  },
  filterTabTextActive: {
    color: THEME.primary,
    fontWeight: "900",
  },
  listTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: THEME.textMuted,
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 12,
    letterSpacing: 1.5,
  },
  listContent: {
    paddingBottom: 120,
  },
  customerItem: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  customerInfo: {
    flex: 1,
  },
  customerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  customerName: {
    fontSize: 17,
    fontWeight: "700",
    color: THEME.textMain,
    flex: 1,
  },
  riskBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  customerPhone: {
    fontSize: 14,
    color: THEME.textMuted,
    fontWeight: "500",
  },
  customerBalance: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  balanceLabel: {
    fontSize: 10,
    color: THEME.textMuted,
    fontWeight: "700",
    letterSpacing: 1,
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: "900",
  },
  riskCardContent: {
    paddingLeft: 20,
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  riskAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: THEME.danger,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
});
