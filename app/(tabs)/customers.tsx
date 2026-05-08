import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { THEME } from "../../constants/theme";
import { NeumorphicCard } from "../../components/ui/NeumorphicCard";
import { SearchBar } from "../../components/ui/SearchBar";
import { EmptyState, Loading } from "../../components/ui/StateIndicators";
import { useAuthStore } from "../../store/authStore";
import { useDataStore } from "../../store/dataStore";
import { useCustomerData, useCustomerSearch } from "../../hooks/useData";
import { customerService } from "../../services/firestore";
import { formatCurrency } from "../../utils/helpers";

export default function CustomersTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { customers, loading: customersLoading } = useCustomerData(user?.shopId || "");
  const { searchResults, handleSearch, searchQuery } = useCustomerSearch(
    user?.shopId || "",
  );
  const { getRiskLevel } = useDataStore();
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
        return THEME.danger;
      case "medium":
        return THEME.warning;
      case "low":
        return THEME.success;
      default:
        return THEME.textMuted;
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
    <View style={styles.container}>
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={{ paddingTop: insets.top }}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Customers</Text>
              <SearchBar onSearch={handleSearch} />
            </View>

            {/* Filter Tabs - Matching Dashboard Style */}
            <View style={styles.filterTabs}>
              {(["all", "high", "medium", "low"] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  onPress={() => setFilterRiskLevel(level)}
                  style={styles.filterTabItem}
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
              <Text style={styles.listLabel}>
                DIRECTORY ({filteredCustomers.length})
              </Text>
            )}
          </View>
        }
        renderItem={({ item: customer }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: "/customer/[id]" as any,
                params: { id: customer.id },
              })
            }
            onLongPress={() => handleDeleteCustomer(customer.id, customer.name)}
          >
            <NeumorphicCard style={styles.customerItem} borderRadius={16} contentStyle={styles.itemContent}>
              <View style={styles.customerInfo}>
                <View style={styles.customerHeader}>
                  <Text style={styles.customerName} numberOfLines={1}>{customer.name}</Text>
                  <View
                    style={[
                      styles.riskBadge,
                      { backgroundColor: getRiskColor(getRiskLevel(customer)) + "20" },
                    ]}
                  >
                    <View style={[styles.dot, { backgroundColor: getRiskColor(getRiskLevel(customer)) }]} />
                    <Text style={[styles.badgeText, { color: getRiskColor(getRiskLevel(customer)) }]}>
                      {getRiskLevel(customer).toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.customerPhone}>{customer.phone}</Text>
              </View>

              <View style={styles.customerBalance}>
                <Text style={styles.balanceLabel}>OUTSTANDING</Text>
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
            icon="🔍"
            title="No Results"
            subtitle={
              searchQuery
                ? "We couldn't find any customers matching that search."
                : "Your customer list is empty. Start by adding one!"
            }
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: THEME.textMain,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  filterTabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterTabItem: {
    flex: 1,
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
  listLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: THEME.textMuted,
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 8,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  listContent: {
    paddingBottom: 120, // Account for tab bar
  },
  customerItem: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  itemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  customerInfo: {
    flex: 1,
    marginRight: 10,
  },
  customerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  customerName: {
    fontSize: 17,
    fontWeight: "700",
    color: THEME.textMain,
    marginRight: 8,
    flexShrink: 1,
  },
  riskBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "900",
  },
  customerPhone: {
    fontSize: 13,
    color: THEME.textMuted,
    fontWeight: "600",
  },
  customerBalance: {
    alignItems: "flex-end",
  },
  balanceLabel: {
    fontSize: 9,
    color: THEME.textMuted,
    fontWeight: "800",
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: "900",
  },
});
