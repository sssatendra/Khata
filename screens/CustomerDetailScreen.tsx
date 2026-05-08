import React from "react";
import {
  Alert,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { THEME } from "@/constants/theme";
import { NeumorphicCard } from "@/components/ui/NeumorphicCard";
import { NeumorphicButton } from "@/components/ui/NeumorphicButton";
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
  onBack: () => void;
}

export const CustomerDetailScreen: React.FC<CustomerDetailScreenProps> = ({
  customer,
  onEditPress,
  onTransactionPress,
  onDeletePress,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
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
      return { level: "high", color: THEME.danger, label: "HIGH RISK" };
    }
    if (daysSincePayment > 15 || customer.balance > 5000) {
      return { level: "medium", color: THEME.warning, label: "CAUTION" };
    }
    return { level: "low", color: THEME.success, label: "HEALTHY" };
  };

  const riskInfo = getRiskLevel();

  return (
    <View style={styles.container}>
      <FlatList
        data={ledgerEntries}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {/* Custom Header with Back Button */}
            <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
              <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <Text style={styles.backButtonIcon}>←</Text>
              </TouchableOpacity>
              <View style={styles.headerContent}>
                <Text style={styles.customerName}>{customer.name}</Text>
                <Text style={styles.customerPhone}>{customer.phone}</Text>
              </View>
              <View style={[styles.riskBadge, { backgroundColor: riskInfo.color + "20" }]}>
                <View style={[styles.dot, { backgroundColor: riskInfo.color }]} />
                <Text style={[styles.riskLabel, { color: riskInfo.color }]}>{riskInfo.label}</Text>
              </View>
            </View>

            {/* Balance Card */}
            <NeumorphicCard 
              borderRadius={24} 
              style={styles.balanceCard}
              contentStyle={styles.balanceContent}
            >
              <Text style={styles.balanceLabel}>
                {customer.balance > 0 ? "TOTAL OUTSTANDING" : "ADVANCE PAYMENT"}
              </Text>
              <Text
                style={[
                  styles.balanceAmount,
                  {
                    color: customer.balance > 0 ? THEME.danger : THEME.success,
                  },
                ]}
              >
                {formatCurrency(customer.balance)}
              </Text>
            </NeumorphicCard>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={{ flex: 1 }}>
                <NeumorphicCard borderRadius={16} style={styles.statItem}>
                  <Text style={styles.statLabel}>DAYS SINCE PAY</Text>
                  <Text style={styles.statValue}>
                    {daysSincePayment === 999
                      ? "Never"
                      : daysSincePayment === 0
                      ? "Today"
                      : `${daysSincePayment} Days`}
                  </Text>
                </NeumorphicCard>
              </View>
              <View style={{ flex: 1 }}>
                <NeumorphicCard borderRadius={16} style={styles.statItem}>
                  <Text style={styles.statLabel}>LAST ACTIVITY</Text>
                  <Text style={styles.statValue}>
                    {customer.lastTransactionDate
                      ? formatDate(customer.lastTransactionDate)
                      : "No activity"}
                  </Text>
                </NeumorphicCard>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <View style={{ flex: 1.5 }}>
                <NeumorphicButton
                  title="ADD TRANSACTION"
                  onPress={onTransactionPress}
                  variant="primary"
                />
              </View>
              <View style={{ flex: 1 }}>
                <NeumorphicButton
                  title="WHATSAPP"
                  onPress={handleWhatsAppMessage}
                  variant="secondary"
                />
              </View>
            </View>

            {/* Ledger Header */}
            <View style={styles.ledgerHeader}>
              <Text style={styles.ledgerTitle}>TRANSACTION HISTORY</Text>
              {ledgerEntries.length > 0 && (
                <Text style={styles.ledgerCount}>
                  {ledgerEntries.length} items
                </Text>
              )}
            </View>
          </>
        }
        renderItem={({ item }) => (
          <NeumorphicCard style={styles.ledgerItem} borderRadius={16} contentStyle={styles.ledgerItemContent}>
            <View style={styles.ledgerItemLeft}>
              <View
                style={[
                  styles.transactionIcon,
                  {
                    backgroundColor:
                      item.type === "credit" ? THEME.danger + "20" : THEME.success + "20",
                  },
                ]}
              >
                <Text style={[styles.icon, { color: item.type === "credit" ? THEME.danger : THEME.success }]}>
                  {item.type === "credit" ? "⬆" : "⬇"}
                </Text>
              </View>
              <View style={styles.ledgerItemInfo}>
                <Text style={styles.ledgerItemType}>
                  {item.type === "credit" ? "Udhar Added" : "Payment Received"}
                </Text>
                {item.note && (
                  <Text style={styles.ledgerItemNote} numberOfLines={1}>{item.note}</Text>
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
                    color: item.type === "credit" ? THEME.danger : THEME.success,
                  },
                ]}
              >
                {item.type === "credit" ? "+" : "-"}
                {formatCurrency(item.amount)}
              </Text>
              <Text style={styles.ledgerItemBalance}>
                BAL: {formatCurrency(item.runningBalance)}
              </Text>
            </View>
          </NeumorphicCard>
        )}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="🔍"
              title="No History"
              subtitle="No transactions recorded for this customer yet."
            />
          ) : null
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Footer Actions */}
      <View style={[styles.footerActions, { paddingBottom: insets.bottom + 12 }]}>
        <View style={{ flex: 1 }}>
          <NeumorphicButton
            title="EDIT PROFILE"
            onPress={onEditPress}
            variant="secondary"
          />
        </View>
        <View style={{ flex: 1 }}>
          <NeumorphicButton
            title="DELETE"
            onPress={onDeletePress}
            variant="secondary"
            style={{ backgroundColor: THEME.danger + "20" }}
          />
        </View>
      </View>

      {loading && <Loading message="Syncing ledger..." />}
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
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  backButtonIcon: {
    fontSize: 20,
    color: THEME.textMain,
    fontWeight: "900",
  },
  headerContent: {
    flex: 1,
  },
  customerName: {
    fontSize: 28,
    fontWeight: "900",
    color: THEME.textMain,
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 16,
    color: THEME.textMuted,
    fontWeight: "700",
  },
  riskBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  riskLabel: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  balanceCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  balanceContent: {
    padding: 24,
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: THEME.textMuted,
    marginBottom: 12,
    letterSpacing: 2,
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: "900",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  statItem: {
    padding: 14,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 10,
    color: THEME.textMuted,
    fontWeight: "800",
    marginBottom: 8,
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "800",
    color: THEME.textMain,
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  ledgerHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ledgerTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: THEME.textMuted,
    letterSpacing: 2,
  },
  ledgerCount: {
    fontSize: 12,
    color: THEME.textMuted,
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 140,
  },
  ledgerItem: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  ledgerItemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  ledgerItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 14,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 20,
    fontWeight: "900",
  },
  ledgerItemInfo: {
    flex: 1,
  },
  ledgerItemType: {
    fontSize: 15,
    fontWeight: "800",
    color: THEME.textMain,
  },
  ledgerItemNote: {
    fontSize: 12,
    color: THEME.textMuted,
    marginTop: 2,
    fontWeight: "600",
  },
  ledgerItemDate: {
    fontSize: 11,
    color: THEME.textMuted,
    marginTop: 4,
    fontWeight: "700",
  },
  ledgerItemRight: {
    alignItems: "flex-end",
  },
  ledgerItemAmount: {
    fontSize: 17,
    fontWeight: "900",
  },
  ledgerItemBalance: {
    fontSize: 11,
    color: THEME.textMuted,
    marginTop: 6,
    fontWeight: "700",
  },
  footerActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: THEME.background + "F0", // Slight transparency
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
});
