import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    Alert,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SearchBar } from "../../components/ui/SearchBar";
import { EmptyState, Loading } from "../../components/ui/StateIndicators";
import { useCustomerData, useCustomerSearch } from "../../hooks/useData";
import { customerService } from "../../services/firestore";
import { useAuthStore } from "../../store/authStore";
import { useDataStore } from "../../store/dataStore";
import { formatCurrency } from "../../utils/helpers";

export default function CustomersTab() {
  const { user } = useAuthStore();
  const { customers, loading: customersLoading } = useCustomerData(user?.shopId || "");
  const { searchResults, handleSearch, searchQuery } = useCustomerSearch(
    user?.shopId || "",
  );
  const { getRiskLevel, updateCustomerInStore } = useDataStore();
  const [filterRiskLevel, setFilterRiskLevel] = useState<
    "all" | "high" | "medium" | "low"
  >("all");

  const filteredCustomers = useMemo(() => {
    let filtered = searchQuery ? searchResults : customers;

    if (filterRiskLevel !== "all") {
      filtered = filtered.filter((c) => getRiskLevel(c) === filterRiskLevel);
    }

    return filtered.sort((a, b) => b.balance - a.balance);
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

  const handleDeleteCustomer = async (customerId: string, name: string) => {
    Alert.alert("Delete Customer", `Are you sure you want to delete ${name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await customerService.deleteCustomer(customerId);
            Alert.alert("Success", "Customer deleted successfully");
          } catch (error) {
            Alert.alert("Error", "Failed to delete customer");
          }
        },
      },
    ]);
  };

  if (customersLoading) {
    return <Loading message="Loading customers..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
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
                All Customers ({filteredCustomers.length})
              </Text>
            )}
          </>
        }
        renderItem={({ item: customer }) => (
          <TouchableOpacity
            style={styles.customerItem}
            onPress={() =>
              router.push({
                pathname: "/customer/[id]",
                params: { id: customer.id },
              })
            }
            onLongPress={() => handleDeleteCustomer(customer.id, customer.name)}
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
            subtitle={
              searchQuery
                ? "Try a different search"
                : "Add your first customer to get started"
            }
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
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
