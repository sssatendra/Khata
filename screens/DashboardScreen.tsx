import React, { useMemo, useState } from "react";
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SearchBar } from "@/components/ui/SearchBar";
import { EmptyState, Loading } from "@/components/ui/StateIndicators";
import {
    useCustomerData,
    useCustomerSearch,
    useDashboardStats,
} from "@/hooks/useData";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import { Customer } from "@/types";
import { formatCurrency } from "@/utils/helpers";

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
  const { user } = useAuthStore();
  const { stats } = useDataStore();
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
        return "#DC2626";
      case "medium":
        return "#F59E0B";
      case "low":
        return "#10B981";
    }
  };

  const getRiskIcon = (level: "low" | "medium" | "high") => {
    switch (level) {
      case "high":
        return "🔴";
      case "medium":
        return "🟠";
      case "low":
        return "🟢";
    }
  };

  if (statsLoading) {
    return <Loading message="Loading dashboard..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Welcome back,</Text>
                <Text style={styles.userName}>{user?.name}</Text>
              </View>
              <TouchableOpacity style={styles.avatarButton}>
                <Text style={styles.avatar}>👤</Text>
              </TouchableOpacity>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Total Outstanding</Text>
                <Text style={styles.statValue}>
                  {formatCurrency(dashboardStats?.totalOutstanding || 0)}
                </Text>
                <Text style={styles.statSubtext}>
                  from {dashboardStats?.totalCustomers || 0} customers
                </Text>
              </View>

              <View style={[styles.statCard, styles.riskCard]}>
                <Text style={styles.riskLabel}>🔴 High Risk</Text>
                <Text style={styles.riskValue}>
                  {dashboardStats?.highRiskCount || 0}
                </Text>
                <Text style={styles.statSubtext}>requires attention</Text>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onNavigateToAddCustomer}
              >
                <Text style={styles.actionIcon}>➕</Text>
                <Text style={styles.actionText}>Add Customer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={onNavigateToCustomers}
              >
                <Text style={styles.actionIcon}>📋</Text>
                <Text style={styles.actionText}>All Customers</Text>
              </TouchableOpacity>
            </View>

            {/* Search & Filter */}
            <SearchBar onSearch={handleSearch} />

            {/* Filter Tabs */}
            <View style={styles.filterTabs}>
              {(["all", "high", "medium", "low"] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.filterTab,
                    filterRiskLevel === level && styles.filterTabActive,
                  ]}
                  onPress={() => setFilterRiskLevel(level)}
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
                </TouchableOpacity>
              ))}
            </View>

            {filteredCustomers.length > 0 && (
              <Text style={styles.listTitle}>
                Top Debtors ({filteredCustomers.length})
              </Text>
            )}
          </>
        }
        renderItem={({ item: customer }) => (
          <TouchableOpacity
            style={styles.customerItem}
            onPress={() => onNavigateToCustomerDetail(customer)}
          >
            <View style={styles.customerInfo}>
              <View style={styles.customerHeader}>
                <Text style={styles.customerName}>{customer.name}</Text>
                <View
                  style={[
                    styles.riskBadge,
                    { backgroundColor: getRiskColor(getRiskLevel(customer)) },
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {getRiskIcon(getRiskLevel(customer))}
                  </Text>
                </View>
              </View>
              <Text style={styles.customerPhone}>{customer.phone}</Text>
            </View>

            <View style={styles.customerBalance}>
              <Text style={styles.balanceLabel}>Balance</Text>
              <Text
                style={[
                  styles.balanceAmount,
                  { color: customer.balance > 0 ? "#DC2626" : "#10B981" },
                ]}
              >
                {formatCurrency(customer.balance)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="📭"
            title="No Customers Found"
            subtitle="Add your first customer to get started"
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
  },
  greeting: {
    fontSize: 14,
    color: "#6B7280",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    fontSize: 20,
  },
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  riskCard: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FEE2E2",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 8,
  },
  riskLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  riskValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#DC2626",
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  quickActions: {
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
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionIcon: {
    fontSize: 18,
  },
  actionText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  filterTabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  filterTabActive: {
    backgroundColor: "#2563EB",
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  filterTabTextActive: {
    color: "#FFFFFF",
  },
  listTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  listContent: {
    paddingBottom: 20,
  },
  customerItem: {
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
  customerInfo: {
    flex: 1,
  },
  customerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  riskBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 14,
  },
  customerPhone: {
    fontSize: 12,
    color: "#6B7280",
  },
  customerBalance: {
    alignItems: "flex-end",
    minWidth: 80,
  },
  balanceLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  balanceAmount: {
    fontSize: 14,
    fontWeight: "700",
  },
});
