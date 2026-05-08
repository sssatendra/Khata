import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import { THEME } from "../constants/theme";
import { NeumorphicCard } from "./ui/NeumorphicCard";
import { Customer, Transaction } from "../types";

interface AnalyticsChartsProps {
  customers: Customer[];
  transactions: Transaction[];
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  customers,
  transactions,
}) => {
  // Use a slightly smaller width to ensure it stays within the screen
  const containerWidth = Dimensions.get("window").width - 32;

  // 1. Prepare Bar Chart Data (Monthly Credit Growth)
  const getMonthlyData = () => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return {
        month: d.toLocaleString("default", { month: "short" }),
        monthNum: d.getMonth(),
        year: d.getFullYear(),
        total: 0,
      };
    });

    transactions.forEach((t) => {
      if (t.type === "credit") {
        const d = new Date(t.createdAt);
        const mIdx = last6Months.findIndex(
          (m) => m.monthNum === d.getMonth() && m.year === d.getFullYear(),
        );
        if (mIdx !== -1) {
          last6Months[mIdx].total += t.amount;
        }
      }
    });

    return {
      labels: last6Months.map((m) => m.month),
      datasets: [
        {
          data: last6Months.map((m) => m.total || 0),
        },
      ],
    };
  };

  // 2. Prepare Pie Chart Data (Risk Distribution)
  const getRiskData = () => {
    const high = customers.filter((c) => c.balance > 10000).length;
    const medium = customers.filter((c) => c.balance > 5000 && c.balance <= 10000).length;
    const low = customers.filter((c) => c.balance <= 5000).length;

    return [
      {
        name: "High",
        population: high,
        color: THEME.danger,
        legendFontColor: THEME.textMuted,
        legendFontSize: 12,
      },
      {
        name: "Med",
        population: medium,
        color: THEME.warning,
        legendFontColor: THEME.textMuted,
        legendFontSize: 12,
      },
      {
        name: "Safe",
        population: low,
        color: THEME.success,
        legendFontColor: THEME.textMuted,
        legendFontSize: 12,
      },
    ];
  };

  const chartConfig = {
    backgroundColor: "transparent",
    backgroundGradientFrom: THEME.background,
    backgroundGradientTo: THEME.background,
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`, // Gold Primary
    labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`, // Slate 400
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: THEME.primary,
    },
    barPercentage: 0.6,
  };

  return (
    <View style={styles.container}>
      {/* Bar Chart Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📈 Monthly Udhar Trend</Text>
        <NeumorphicCard borderRadius={20} style={styles.card} contentStyle={{ padding: 0 }}>
          <BarChart
            data={getMonthlyData()}
            width={containerWidth}
            height={200}
            yAxisLabel="₹"
            yAxisSuffix=""
            chartConfig={chartConfig}
            verticalLabelRotation={0}
            style={styles.chart}
            showValuesOnTopOfBars
            fromZero
          />
        </NeumorphicCard>
      </View>

      {/* Pie Chart Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Customer Risk Breakdown</Text>
        <NeumorphicCard borderRadius={20} style={styles.card} contentStyle={{ padding: 0 }}>
          <PieChart
            data={getRiskData()}
            width={containerWidth}
            height={180}
            chartConfig={chartConfig}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"0"}
            center={[10, 0]}
            absolute
          />
        </NeumorphicCard>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: THEME.textMuted,
    marginBottom: 16,
    marginLeft: 4,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  card: {
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
});
