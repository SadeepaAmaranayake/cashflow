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
  "#2563eb",
  "#16a34a",
  "#d97706",
  "#7c3aed",
  "#db2777",
  "#0891b2",
  "#65a30d",
  "#ea580c",
] as const;

function getShortCategoryLabel(
  category: string,
): string {
  if (category === "Entertainment") {
    return "Entertain.";
  }

  if (category === "Mobile/Data") {
    return "Mobile";
  }

  return category;
}

function formatLkrAxisLabel(
  label: string,
): string {
  const amountMinor = Number(label);

  if (!Number.isFinite(amountMinor)) {
    return label;
  }

  const amountLkr = amountMinor / 100;

  if (amountLkr >= 1_000_000) {
    const millions = (
      amountLkr / 1_000_000
    )
      .toFixed(1)
      .replace(/\.0$/, "");

    return `LKR ${millions}m`;
  }

  if (amountLkr >= 1_000) {
    const thousands = (
      amountLkr / 1_000
    )
      .toFixed(1)
      .replace(/\.0$/, "");

    return `LKR ${thousands}k`;
  }

  return `LKR ${Math.round(amountLkr)}`;
}

export function ExpenseCategoryChart({
  items,
}: ExpenseCategoryChartProps) {
  const theme = useTheme();

  const chartData = items.map(
    (item, index) => ({
      value: item.totalMinor,
      label: getShortCategoryLabel(
        item.category,
      ),
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

      <Text
        style={[
          styles.helpText,
          {
            color: theme.textSecondary,
          },
        ]}
      >
        Swipe horizontally to view all categories.
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
          yAxisLabelWidth={72}
          formatYLabel={formatLkrAxisLabel}
          xAxisThickness={1}
          xAxisColor={theme.textSecondary}
          rulesColor={theme.backgroundSelected}
          xAxisLabelTextStyle={{
            color: theme.textSecondary,
            fontSize: 11,
          }}
          yAxisTextStyle={{
            color: theme.textSecondary,
            fontSize: 10,
          }}
          disableScroll
        />
      </ScrollView>

      <View style={styles.values}>
        {items.map((item, index) => {
          const formattedAmount =
            formatMoney(item.totalMinor);

          return (
            <View
              key={item.category}
              accessible
              accessibilityLabel={`${item.category}, ${formattedAmount}`}
              style={styles.valueRow}
            >
              <View
                accessible={false}
                style={[
                  styles.colorIndicator,
                  {
                    backgroundColor:
                      BAR_COLORS[
                        index %
                          BAR_COLORS.length
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
                {formattedAmount}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 16,
    borderRadius: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
  },

  helpText: {
    fontSize: 13,
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