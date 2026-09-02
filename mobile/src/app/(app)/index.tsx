import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  useFocusEffect,
  useRouter,
} from "expo-router";

import { useTheme } from "@/hooks/use-theme";
import {
  getDashboardSummary,
} from "@/services/dashboard";
import { getApiErrorMessage } from "@/services/api";
import type {
  DashboardSummary,
  Transaction,
} from "@/types/api";
import { formatMoney } from "@/utils/money";

export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [summary, setSummary] =
    useState<DashboardSummary | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadDashboard = useCallback(
    async (isManualRefresh: boolean) => {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setErrorMessage(null);

      try {
        const data = await getDashboardSummary();

        setSummary(data);
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(error),
        );
      } finally {
        if (isManualRefresh) {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      void loadDashboard(false);
    }, [loadDashboard]),
  );

  function renderTransaction(
    transaction: Transaction,
  ) {
    const isIncome =
      transaction.type === "income";

    return (
      <View
        key={transaction.id}
        style={[
          styles.transactionRow,
          {
            borderBottomColor:
              theme.backgroundSelected,
          },
        ]}
      >
        <View style={styles.transactionText}>
          <Text
            style={[
              styles.transactionCategory,
              { color: theme.text },
            ]}
          >
            {transaction.category}
          </Text>

          <Text
            style={[
              styles.transactionDate,
              { color: theme.textSecondary },
            ]}
          >
            {new Date(
              transaction.transactionDate,
            ).toLocaleDateString("en-LK", {
              day: "numeric",
              month: "short",
            })}
          </Text>
        </View>

        <Text
          style={[
            styles.transactionAmount,
            {
              color: isIncome
                ? "#16A34A"
                : "#DC2626",
            },
          ]}
        >
          {isIncome ? "+" : "-"}
          {formatMoney(transaction.amountMinor)}
        </Text>
      </View>
    );
  }

  if (isLoading && summary === null) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: theme.background },
        ]}
      >
        <ActivityIndicator
          color={theme.text}
          size="large"
        />

        <Text
          style={[
            styles.loadingText,
            { color: theme.textSecondary },
          ]}
        >
          Loading dashboard…
        </Text>
      </View>
    );
  }

  if (summary === null) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: theme.background },
        ]}
      >
        <Text
          style={[
            styles.errorText,
            { color: "#DC2626" },
          ]}
        >
          {errorMessage ??
            "Unable to load the dashboard."}
        </Text>

        <Pressable
          onPress={() => {
            void loadDashboard(false);
          }}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>
            Retry
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { backgroundColor: theme.background },
      ]}
      refreshControl={
        <RefreshControl
          colors={["#2563EB"]}
          onRefresh={() => {
            void loadDashboard(true);
          }}
          refreshing={isRefreshing}
          tintColor={theme.text}
        />
      }
    >
      <Text
        style={[
          styles.heading,
          { color: theme.text },
        ]}
      >
        Overview
      </Text>

      {errorMessage ? (
        <View
          style={[
            styles.errorBanner,
            { backgroundColor: theme.backgroundElement },
          ]}
        >
          <Text
            style={[
              styles.errorText,
              { color: "#DC2626" },
            ]}
          >
            {errorMessage}
          </Text>

          <Pressable
            disabled={isRefreshing}
            onPress={() => {
              void loadDashboard(true);
            }}
          >
            <Text style={styles.retryText}>
              Retry
            </Text>
          </Pressable>
        </View>
      ) : null}

      <View
        style={[
          styles.balanceCard,
          { backgroundColor: theme.backgroundElement },
        ]}
      >
        <Text
          style={[
            styles.cardLabel,
            { color: theme.textSecondary },
          ]}
        >
          Current balance
        </Text>

        <Text
          style={[
            styles.balanceAmount,
            { color: theme.text },
          ]}
        >
          {formatMoney(summary.balanceMinor)}
        </Text>
      </View>

      <View style={styles.cardRow}>
        <View
          style={[
            styles.smallCard,
            { backgroundColor: theme.backgroundElement },
          ]}
        >
          <Text
            style={[
              styles.cardLabel,
              { color: theme.textSecondary },
            ]}
          >
            Today spent
          </Text>

          <Text
            style={[
              styles.smallAmount,
              { color: "#DC2626" },
            ]}
          >
            {formatMoney(summary.todaySpentMinor)}
          </Text>
        </View>
      </View>

      <View style={styles.cardRow}>
        <View
          style={[
            styles.smallCard,
            { backgroundColor: theme.backgroundElement },
          ]}
        >
          <Text
            style={[
              styles.cardLabel,
              { color: theme.textSecondary },
            ]}
          >
            Month income
          </Text>

          <Text
            style={[
              styles.smallAmount,
              { color: "#16A34A" },
            ]}
          >
            {formatMoney(
              summary.currentMonthIncomeMinor,
            )}
          </Text>
        </View>

        <View
          style={[
            styles.smallCard,
            { backgroundColor: theme.backgroundElement },
          ]}
        >
          <Text
            style={[
              styles.cardLabel,
              { color: theme.textSecondary },
            ]}
          >
            Month expenses
          </Text>

          <Text
            style={[
              styles.smallAmount,
              { color: "#DC2626" },
            ]}
          >
            {formatMoney(
              summary.currentMonthExpensesMinor,
            )}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={() => router.push("/add")}
        style={styles.primaryButton}
      >
        <Text style={styles.primaryButtonText}>
          Add expense
        </Text>
      </Pressable>

      <Text
        style={[
          styles.sectionHeading,
          { color: theme.text },
        ]}
      >
        Recent transactions
      </Text>

      {summary.recentTransactions.length === 0 ? (
        <Text
          style={[
            styles.emptyText,
            { color: theme.textSecondary },
          ]}
        >
          No transactions yet.
        </Text>
      ) : (
        <View
          style={[
            styles.recentContainer,
            { backgroundColor: theme.backgroundElement },
          ]}
        >
          {summary.recentTransactions.map(
            renderTransaction,
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    flex: 1,
    gap: 16,
    justifyContent: "center",
    padding: 24,
  },

  content: {
    flexGrow: 1,
    gap: 16,
    padding: 20,
  },

  heading: {
    fontSize: 28,
    fontWeight: "700",
  },

  balanceCard: {
    borderRadius: 16,
    gap: 8,
    padding: 20,
  },

  cardRow: {
    flexDirection: "row",
    gap: 12,
  },

  smallCard: {
    borderRadius: 16,
    flex: 1,
    gap: 8,
    padding: 16,
  },

  cardLabel: {
    fontSize: 14,
  },

  balanceAmount: {
    fontSize: 32,
    fontWeight: "700",
  },

  smallAmount: {
    fontSize: 18,
    fontWeight: "700",
  },

  primaryButton: {
    alignItems: "center",
    backgroundColor: "#2563EB",
    borderRadius: 12,
    padding: 16,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  sectionHeading: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 8,
  },

  recentContainer: {
    borderRadius: 16,
    paddingHorizontal: 16,
  },

  transactionRow: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
  },

  transactionText: {
    gap: 4,
  },

  transactionCategory: {
    fontSize: 16,
    fontWeight: "600",
  },

  transactionDate: {
    fontSize: 13,
  },

  transactionAmount: {
    fontSize: 15,
    fontWeight: "700",
  },

  loadingText: {
    fontSize: 16,
  },

  emptyText: {
    fontSize: 15,
    textAlign: "center",
  },

  errorBanner: {
    borderRadius: 12,
    gap: 8,
    padding: 16,
  },

  errorText: {
    fontSize: 15,
  },

  retryText: {
    color: "#2563EB",
    fontSize: 15,
    fontWeight: "700",
  },
});