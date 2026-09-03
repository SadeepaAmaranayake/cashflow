import {
  ActivityIndicator,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  useEffect,
  useState,
} from "react";

import { ExpenseCategoryChart } from "@/components/charts/expense-category-chart";
import { useTheme } from "@/hooks/use-theme";
import {
  getApiErrorMessage,
} from "@/services/api";
import {
  getMonthlyReport,
} from "@/services/reports";
import type {
  MonthlyReport,
} from "@/types/api";
import { formatMoney } from "@/utils/money";

interface MonthSelection {
  month: number;
  year: number;
}

function getCurrentMonth(): MonthSelection {
  const now = new Date();

  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

function getMonthIndex(
  selection: MonthSelection,
): number {
  return (
    selection.year * 12 +
    selection.month -
    1
  );
}

function moveMonth(
  selection: MonthSelection,
  amount: number,
): MonthSelection {
  const date = new Date(
    selection.year,
    selection.month - 1 + amount,
    1,
  );

  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

function formatMonthName(
  selection: MonthSelection,
): string {
  return new Intl.DateTimeFormat(
    undefined,
    {
      month: "long",
      year: "numeric",
    },
  ).format(
    new Date(
      selection.year,
      selection.month - 1,
      1,
    ),
  );
}

interface TotalCardProps {
  label: string;
  value: string;
  color: string;
  backgroundColor: string;
}

function TotalCard({
  label,
  value,
  color,
  backgroundColor,
}: TotalCardProps) {
  return (
    <View
      style={[
        styles.totalCard,
        {
          backgroundColor,
        },
      ]}
    >
      <Text
        style={[
          styles.totalLabel,
          {
            color,
          },
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.totalValue,
          {
            color,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export default function ReportsScreen() {
  const theme = useTheme();

  const [selection, setSelection] =
    useState<MonthSelection>(
      getCurrentMonth,
    );

  const [report, setReport] =
    useState<MonthlyReport | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [retryNumber, setRetryNumber] =
    useState(0);

  useEffect(() => {
    let isCurrentRequest = true;

    async function loadReport(): Promise<void> {
      setIsLoading(true);
      setErrorMessage(null);
      setReport(null);

      try {
        const nextReport =
          await getMonthlyReport(
            selection.month,
            selection.year,
          );

        if (isCurrentRequest) {
          setReport(nextReport);
        }
      } catch (error) {
        if (isCurrentRequest) {
          setErrorMessage(
            getApiErrorMessage(error),
          );
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      }
    }

    void loadReport();

    return () => {
      isCurrentRequest = false;
    };
  }, [
    selection.month,
    selection.year,
    retryNumber,
  ]);

  const currentMonth = getCurrentMonth();

  const canMoveToNextMonth =
    getMonthIndex(selection) <
    getMonthIndex(currentMonth);

  const canMoveToPreviousMonth =
    selection.year > 2000 ||
    selection.month > 1;

  const isEmpty =
    report !== null &&
    report.totals.incomeMinor === 0 &&
    report.totals.expensesMinor === 0;

  function showPreviousMonth(): void {
    if (!canMoveToPreviousMonth) {
      return;
    }

    setSelection((current) =>
      moveMonth(current, -1),
    );
  }

  function showNextMonth(): void {
    if (!canMoveToNextMonth) {
      return;
    }

    setSelection((current) =>
      moveMonth(current, 1),
    );
  }

  function retryRequest(): void {
    setRetryNumber(
      (current) => current + 1,
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <Text
        style={[
          styles.heading,
          {
            color: theme.text,
          },
        ]}
      >
        Monthly report
      </Text>

      <View style={styles.monthNavigation}>
        <Button
          title="Previous"
          disabled={
            isLoading ||
            !canMoveToPreviousMonth
          }
          onPress={showPreviousMonth}
        />

        <Text
          style={[
            styles.monthName,
            {
              color: theme.text,
            },
          ]}
        >
          {formatMonthName(selection)}
        </Text>

        <Button
          title="Next"
          disabled={
            isLoading ||
            !canMoveToNextMonth
          }
          onPress={showNextMonth}
        />
      </View>

      {isLoading && (
        <View style={styles.stateContainer}>
          <ActivityIndicator
            size="large"
            color={theme.text}
          />

          <Text
            style={{
              color: theme.textSecondary,
            }}
          >
            Loading monthly report…
          </Text>
        </View>
      )}

      {!isLoading && errorMessage && (
        <View
          style={[
            styles.stateContainer,
            {
              backgroundColor:
                theme.backgroundElement,
            },
          ]}
        >
          <Text style={styles.errorText}>
            {errorMessage}
          </Text>

          <Button
            title="Retry"
            onPress={retryRequest}
          />
        </View>
      )}

      {!isLoading && report && (
        <>
          <View style={styles.totalGrid}>
            <TotalCard
              label="Income"
              value={formatMoney(
                report.totals.incomeMinor,
              )}
              color="#15803d"
              backgroundColor="#dcfce7"
            />

            <TotalCard
              label="Expenses"
              value={formatMoney(
                report.totals.expensesMinor,
              )}
              color="#b91c1c"
              backgroundColor="#fee2e2"
            />

            <TotalCard
              label="Net"
              value={formatMoney(
                report.totals.netMinor,
              )}
              color={
                report.totals.netMinor >= 0
                  ? "#1d4ed8"
                  : "#b91c1c"
              }
              backgroundColor={
                report.totals.netMinor >= 0
                  ? "#dbeafe"
                  : "#fee2e2"
              }
            />
          </View>

          {isEmpty && (
            <View
              style={[
                styles.stateContainer,
                {
                  backgroundColor:
                    theme.backgroundElement,
                },
              ]}
            >
              <Text
                style={[
                  styles.emptyTitle,
                  {
                    color: theme.text,
                  },
                ]}
              >
                No transactions
              </Text>

              <Text
                style={{
                  color: theme.textSecondary,
                }}
              >
                There are no transactions for{" "}
                {formatMonthName(selection)}.
              </Text>
            </View>
          )}

          {!isEmpty &&
            report.expensesByCategory.length >
              0 && (
              <ExpenseCategoryChart
                items={
                  report.expensesByCategory
                }
              />
            )}

          {!isEmpty &&
            report.expensesByCategory.length ===
              0 && (
              <View
                style={[
                  styles.stateContainer,
                  {
                    backgroundColor:
                      theme.backgroundElement,
                  },
                ]}
              >
                <Text
                  style={{
                    color:
                      theme.textSecondary,
                  }}
                >
                  This month has income but no
                  expense category data.
                </Text>
              </View>
            )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    gap: 24,
    padding: 24,
  },

  heading: {
    fontSize: 28,
    fontWeight: "700",
  },

  monthNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  monthName: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
  },

  totalGrid: {
    gap: 12,
  },

  totalCard: {
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },

  totalLabel: {
    fontSize: 14,
    fontWeight: "600",
  },

  totalValue: {
    fontSize: 22,
    fontWeight: "700",
  },

  stateContainer: {
    alignItems: "center",
    gap: 16,
    padding: 24,
    borderRadius: 12,
  },

  errorText: {
    color: "#dc2626",
    textAlign: "center",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
});