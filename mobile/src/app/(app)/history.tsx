import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  useFocusEffect,
  useRouter,
} from "expo-router";

import { useTheme } from "@/hooks/use-theme";
import { getApiErrorMessage } from "@/services/api";
import {
  listTransactions,
} from "@/services/transactions";
import type {
  Pagination,
  Transaction,
} from "@/types/api";
import { formatMoney } from "@/utils/money";

const PAGE_SIZE = 20;

export default function HistoryScreen() {
  const router = useRouter();
  const theme = useTheme();

  const [items, setItems] = useState<
    Transaction[]
  >([]);

  const [pagination, setPagination] =
    useState<Pagination | null>(null);

  const [isInitialLoading, setIsInitialLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [isLoadingMore, setIsLoadingMore] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadFirstPage = useCallback(
    async (isRefresh: boolean) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsInitialLoading(true);
      }

      setErrorMessage(null);

      try {
        const response =
          await listTransactions({
            page: 1,
            limit: PAGE_SIZE,
          });

        setItems(response.items);
        setPagination(response.pagination);
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(error),
        );
      } finally {
        if (isRefresh) {
          setIsRefreshing(false);
        } else {
          setIsInitialLoading(false);
        }
      }
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      void loadFirstPage(false);
    }, [loadFirstPage]),
  );

  const loadMore = useCallback(async () => {
    if (
      !pagination ||
      isInitialLoading ||
      isRefreshing ||
      isLoadingMore ||
      pagination.page >= pagination.totalPages
    ) {
      return;
    }

    setIsLoadingMore(true);

    try {
      const response =
        await listTransactions({
          page: pagination.page + 1,
          limit: PAGE_SIZE,
        });

      setItems((currentItems) => {
        const existingIds = new Set(
          currentItems.map((item) => item.id),
        );

        const newItems = response.items.filter(
          (item) => !existingIds.has(item.id),
        );

        return [...currentItems, ...newItems];
      });

      setPagination(response.pagination);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error),
      );
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    isInitialLoading,
    isLoadingMore,
    isRefreshing,
    pagination,
  ]);

  function renderTransaction({
    item,
  }: {
    item: Transaction;
  }) {
    const isIncome = item.type === "income";

    return (
      <View
        style={[
          styles.transactionCard,
          {
            backgroundColor:
              theme.backgroundElement,
          },
        ]}
      >
        <View style={styles.transactionTopRow}>
          <View style={styles.transactionDetails}>
            <Text
              style={[
                styles.category,
                { color: theme.text },
              ]}
            >
              {item.category}
            </Text>

            <Text
              style={[
                styles.typeLabel,
                {
                  color: isIncome
                    ? "#16A34A"
                    : "#DC2626",
                },
              ]}
            >
              {isIncome
                ? "Income"
                : "Expense"}
            </Text>
          </View>

          <Text
            style={[
              styles.amount,
              {
                color: isIncome
                  ? "#16A34A"
                  : "#DC2626",
              },
            ]}
          >
            {isIncome ? "+" : "-"}
            {formatMoney(item.amountMinor)}
          </Text>
        </View>

        <Text
          style={[
            styles.description,
            { color: theme.textSecondary },
          ]}
        >
          {item.description?.trim() ||
            "No description"}
        </Text>

        <Text
          style={[
            styles.date,
            { color: theme.textSecondary },
          ]}
        >
          {new Date(
            item.transactionDate,
          ).toLocaleString("en-LK", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </Text>
      </View>
    );
  }

  function renderEmptyState() {
    if (errorMessage) {
      return (
        <View style={styles.emptyState}>
          <Text
            style={[
              styles.errorText,
              { color: "#DC2626" },
            ]}
          >
            {errorMessage}
          </Text>

          <Pressable
            onPress={() => {
              void loadFirstPage(false);
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
      <View style={styles.emptyState}>
        <Text
          style={[
            styles.emptyTitle,
            { color: theme.text },
          ]}
        >
          No transactions yet
        </Text>

        <Text
          style={[
            styles.emptyText,
            { color: theme.textSecondary },
          ]}
        >
          Add your first expense or income to see it here.
        </Text>

        <Pressable
          onPress={() => router.push("/add")}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>
            Add transaction
          </Text>
        </Pressable>
      </View>
    );
  }

  if (isInitialLoading && items.length === 0) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.background },
        ]}
      >
        <ActivityIndicator
          color={theme.text}
          size="large"
        />

        <Text
          style={{ color: theme.textSecondary }}
        >
          Loading transactions…
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={[
        styles.listContent,
        items.length === 0 && styles.emptyList,
        { backgroundColor: theme.background },
      ]}
      data={items}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={renderEmptyState}
      ListFooterComponent={
        isLoadingMore ? (
          <ActivityIndicator
            color={theme.text}
            style={styles.footerLoader}
          />
        ) : null
      }
      ListHeaderComponent={
        <>
          <Text
            style={[
              styles.heading,
              { color: theme.text },
            ]}
          >
            Transaction history
          </Text>

          {errorMessage && items.length > 0 ? (
            <View
              style={[
                styles.errorBanner,
                {
                  backgroundColor:
                    theme.backgroundElement,
                },
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
                onPress={() => {
                  void loadFirstPage(true);
                }}
              >
                <Text style={styles.retryText}>
                  Retry
                </Text>
              </Pressable>
            </View>
          ) : null}
        </>
      }
      onEndReached={() => {
        void loadMore();
      }}
      onEndReachedThreshold={0.4}
      onRefresh={() => {
        void loadFirstPage(true);
      }}
      refreshing={isRefreshing}
      renderItem={renderTransaction}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    flexGrow: 1,
    gap: 12,
    padding: 20,
  },

  emptyList: {
    justifyContent: "center",
  },

  loadingContainer: {
    alignItems: "center",
    flex: 1,
    gap: 16,
    justifyContent: "center",
    padding: 24,
  },

  heading: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },

  transactionCard: {
    borderRadius: 14,
    gap: 8,
    padding: 16,
  },

  transactionTopRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  transactionDetails: {
    gap: 4,
  },

  category: {
    fontSize: 17,
    fontWeight: "700",
  },

  typeLabel: {
    fontSize: 14,
    fontWeight: "600",
  },

  amount: {
    fontSize: 16,
    fontWeight: "700",
  },

  description: {
    fontSize: 15,
  },

  date: {
    fontSize: 13,
  },

  emptyState: {
    alignItems: "center",
    gap: 14,
    padding: 24,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
  },

  emptyText: {
    fontSize: 15,
    textAlign: "center",
  },

  primaryButton: {
    alignItems: "center",
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  footerLoader: {
    marginVertical: 16,
  },

  errorBanner: {
    borderRadius: 10,
    gap: 8,
    marginBottom: 4,
    padding: 14,
  },

  errorText: {
    fontSize: 15,
  },

  retryText: {
    color: "#2563EB",
    fontWeight: "700",
  },
});