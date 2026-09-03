import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";

import { useTheme } from "@/hooks/use-theme";
import type { MonthlyReport } from "@/types/api";
import { formatMoney } from "@/utils/money";

interface ExpenseCategoryChartProps {
  items: MonthlyReport["expensesByCategory"];
}

const BAR_COLORS = [
  "#ef4444",
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f97316",
] as const;

export function ExpenseCategoryChart({
  items,
}: ExpenseCategoryChartProps) {
  const theme = useTheme();

  const chartData = items.map(
    (item, index) => ({
      value: item.totalMinor,
      label: item.category,
      frontColor:
        BAR_COLORS[index % BAR_COLORS.length],
    }),
  );

  const chartWidth = Math.max(
    280,
    chartData.length * 80,
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme.backgroundElement,
        },
      ]}
    >
      <Text
        style={[
          styles.title,
          {
            color: theme.text,
          },
        ]}
      >
        Expenses by category
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator
      >
        <BarChart
          data={chartData}
          width={chartWidth}
          height={220}
          barWidth={40}
          spacing={40}
          initialSpacing={20}
          noOfSections={4}
          yAxisThickness={0}
          xAxisThickness={1}
          xAxisColor={theme.textSecondary}
          rulesColor={theme.backgroundSelected}
          xAxisLabelTextStyle={{
            color: theme.textSecondary,
            fontSize: 11,
          }}
          yAxisTextStyle={{
            color: theme.textSecondary,
            fontSize: 11,
          }}
        />
      </ScrollView>

      <View style={styles.values}>
        {items.map((item, index) => (
          <View
            key={item.category}
            style={styles.valueRow}
          >
            <View
              style={[
                styles.colorIndicator,
                {
                  backgroundColor:
                    BAR_COLORS[
                      index % BAR_COLORS.length
                    ],
                },
              ]}
            />

            <Text
              style={[
                styles.category,
                {
                  color: theme.text,
                },
              ]}
            >
              {item.category}
            </Text>

            <Text
              style={[
                styles.amount,
                {
                  color: theme.text,
                },
              ]}
            >
              {formatMoney(item.totalMinor)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    padding: 16,
    borderRadius: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
  },

  values: {
    gap: 12,
  },

  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },

  category: {
    flex: 1,
    fontSize: 14,
  },

  amount: {
    fontSize: 14,
    fontWeight: "600",
  },
});