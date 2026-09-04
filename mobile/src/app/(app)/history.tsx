import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import {
  Controller,
  useForm,
} from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  useFocusEffect,
  useRouter,
} from "expo-router";

import {
  TRANSACTION_CATEGORIES,
} from "@/constants/categories";
import { useTheme } from "@/hooks/use-theme";
import {
  getApiErrorMessage,
  getApiErrorStatus,
} from "@/services/api";
import {
  deleteTransaction,
  listTransactions,
  updateTransaction,
  type UpdateTransactionInput,
} from "@/services/transactions";
import type {
  Pagination,
  Transaction,
} from "@/types/api";
import {
  formatMoney,
  formatMoneyInput,
  parseMoneyInput,
} from "@/utils/money";
import {
  transactionFormSchema,
  type TransactionFormValues,
} from "@/validation/transaction";

const PAGE_SIZE = 20;

function getEditFormValues(
  transaction: Transaction,
): TransactionFormValues {
  return {
    type: transaction.type,
    amount: formatMoneyInput(
      transaction.amountMinor,
    ),
    category: transaction.category,
    description: transaction.description ?? "",
    transactionDate: transaction.transactionDate,
  };
}

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

  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const [editedReviewed, setEditedReviewed] =
    useState(false);

  const [editError, setEditError] =
    useState<string | null>(null);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    reset: resetEditForm,
    formState: {
      isSubmitting: isSavingEdit,
    },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    mode: "onTouched",
    defaultValues: {
      type: "expense",
      amount: "",
      category: "Food",
      description: "",
      transactionDate: new Date().toISOString(),
    },
  });

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

  function openEditForm(
    transaction: Transaction,
  ): void {
    resetEditForm(
      getEditFormValues(transaction),
    );
    setEditedReviewed(transaction.reviewed);
    setEditError(null);
    setSelectedTransaction(transaction);
  }

  function closeEditForm(): void {
    if (isSavingEdit) {
      return;
    }

    setEditError(null);
    setSelectedTransaction(null);
  }

  async function saveTransactionEdits(
    values: TransactionFormValues,
  ): Promise<void> {
    if (!selectedTransaction) {
      return;
    }

    setEditError(null);

    const parsedAmount = parseMoneyInput(
      values.amount,
    );

    if (!parsedAmount.ok) {
      setEditError(parsedAmount.message);
      return;
    }

    const changes: UpdateTransactionInput = {};

    if (values.type !== selectedTransaction.type) {
      changes.type = values.type;
    }

    if (
      parsedAmount.amountMinor !==
      selectedTransaction.amountMinor
    ) {
      changes.amount = values.amount;
    }

    if (
      values.category !==
      selectedTransaction.category
    ) {
      changes.category = values.category;
    }

    const description = values.description.trim();
    const previousDescription =
      selectedTransaction.description?.trim() ?? "";

    if (description !== previousDescription) {
      changes.description = description;
    }

    if (
      values.transactionDate !==
      selectedTransaction.transactionDate
    ) {
      changes.transactionDate =
        values.transactionDate;
    }

    if (
      editedReviewed !==
      selectedTransaction.reviewed
    ) {
      changes.reviewed = editedReviewed;
    }

    if (Object.keys(changes).length === 0) {
      setSelectedTransaction(null);
      return;
    }

    try {
      await updateTransaction(
        selectedTransaction.id,
        changes,
      );

      setSelectedTransaction(null);
      await loadFirstPage(true);
    } catch (error) {
      if (getApiErrorStatus(error) === 404) {
        setSelectedTransaction(null);
        await loadFirstPage(true);
        setErrorMessage(
          "This transaction no longer exists. The list was refreshed.",
        );
        return;
      }

      setEditError(getApiErrorMessage(error));
    }
  }

  async function removeTransaction(
    transaction: Transaction,
  ): Promise<void> {
    if (deletingId) {
      return;
    }

    setDeletingId(transaction.id);
    setErrorMessage(null);

    try {
      await deleteTransaction(transaction.id);
      await loadFirstPage(true);
    } catch (error) {
      if (getApiErrorStatus(error) === 404) {
        await loadFirstPage(true);
        setErrorMessage(
          "This transaction no longer exists. The list was refreshed.",
        );
      } else {
        setErrorMessage(
          getApiErrorMessage(error),
        );
      }
    } finally {
      setDeletingId(null);
    }
  }

  function confirmDelete(
    transaction: Transaction,
  ): void {
    const message =
      `Delete the ${transaction.category} ` +
      `${transaction.type} of ${formatMoney(transaction.amountMinor)}?`;

    if (Platform.OS === "web") {
      if (globalThis.confirm(message)) {
        void removeTransaction(transaction);
      }

      return;
    }

    Alert.alert(
      "Delete transaction?",
      message,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void removeTransaction(transaction);
          },
        },
      ],
    );
  }

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

        <View style={styles.transactionActions}>
          <Pressable
            accessibilityRole="button"
            disabled={
              deletingId !== null || isSavingEdit
            }
            onPress={() => openEditForm(item)}
            style={({ pressed }) => [
              styles.secondaryButton,
              {
                borderColor: theme.textSecondary,
                opacity:
                  pressed ||
                  deletingId !== null ||
                  isSavingEdit
                    ? 0.55
                    : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.secondaryButtonText,
                { color: theme.text },
              ]}
            >
              Edit
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={
              deletingId !== null || isSavingEdit
            }
            onPress={() => confirmDelete(item)}
            style={({ pressed }) => [
              styles.deleteButton,
              {
                opacity:
                  pressed ||
                  deletingId !== null ||
                  isSavingEdit
                    ? 0.55
                    : 1,
              },
            ]}
          >
            <Text style={styles.deleteButtonText}>
              {deletingId === item.id
                ? "Deleting..."
                : "Delete"}
            </Text>
          </Pressable>
        </View>
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
    <>
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

      <Modal
        animationType="slide"
        onRequestClose={closeEditForm}
        transparent
        visible={selectedTransaction !== null}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.background },
            ]}
          >
            <ScrollView
              contentContainerStyle={styles.modalContent}
              keyboardShouldPersistTaps="handled"
            >
              <Text
                style={[
                  styles.modalTitle,
                  { color: theme.text },
                ]}
              >
                Edit transaction
              </Text>

              <Controller
                control={editControl}
                name="type"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.formField}>
                    <Text style={{ color: theme.text }}>
                      Type
                    </Text>

                    <View style={styles.segmentedControl}>
                      {(["expense", "income"] as const).map(
                        (type) => {
                          const isSelected = value === type;

                          return (
                            <Pressable
                              key={type}
                              disabled={isSavingEdit}
                              onPress={() => onChange(type)}
                              style={[
                                styles.segment,
                                {
                                  backgroundColor: isSelected
                                    ? "#2563EB"
                                    : theme.backgroundElement,
                                },
                              ]}
                            >
                              <Text
                                style={{
                                  color: isSelected
                                    ? "#FFFFFF"
                                    : theme.text,
                                  fontWeight: "700",
                                }}
                              >
                                {type === "expense"
                                  ? "Expense"
                                  : "Income"}
                              </Text>
                            </Pressable>
                          );
                        },
                      )}
                    </View>
                  </View>
                )}
              />

              <Controller
                control={editControl}
                name="amount"
                render={({
                  field: { onBlur, onChange, value },
                  fieldState,
                }) => (
                  <View style={styles.formField}>
                    <Text style={{ color: theme.text }}>
                      Amount (LKR)
                    </Text>

                    <TextInput
                      editable={!isSavingEdit}
                      keyboardType="decimal-pad"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      placeholder="0.00"
                      placeholderTextColor={
                        theme.textSecondary
                      }
                      style={[
                        styles.input,
                        {
                          backgroundColor:
                            theme.backgroundElement,
                          color: theme.text,
                        },
                      ]}
                      value={value}
                    />

                    {fieldState.error?.message ? (
                      <Text style={styles.fieldError}>
                        {fieldState.error.message}
                      </Text>
                    ) : null}
                  </View>
                )}
              />

              <Controller
                control={editControl}
                name="category"
                render={({
                  field: { onChange, value },
                  fieldState,
                }) => (
                  <View style={styles.formField}>
                    <Text style={{ color: theme.text }}>
                      Category
                    </Text>

                    <View style={styles.categoryGrid}>
                      {TRANSACTION_CATEGORIES.map(
                        (category) => {
                          const isSelected =
                            category === value;

                          return (
                            <Pressable
                              key={category}
                              disabled={isSavingEdit}
                              onPress={() => onChange(category)}
                              style={[
                                styles.categoryChip,
                                {
                                  backgroundColor: isSelected
                                    ? "#2563EB"
                                    : theme.backgroundElement,
                                  borderColor: isSelected
                                    ? "#2563EB"
                                    : theme.textSecondary,
                                },
                              ]}
                            >
                              <Text
                                style={{
                                  color: isSelected
                                    ? "#FFFFFF"
                                    : theme.text,
                                }}
                              >
                                {category}
                              </Text>
                            </Pressable>
                          );
                        },
                      )}
                    </View>

                    {fieldState.error?.message ? (
                      <Text style={styles.fieldError}>
                        {fieldState.error.message}
                      </Text>
                    ) : null}
                  </View>
                )}
              />

              <Controller
                control={editControl}
                name="description"
                render={({
                  field: { onBlur, onChange, value },
                  fieldState,
                }) => (
                  <View style={styles.formField}>
                    <Text style={{ color: theme.text }}>
                      Description (optional)
                    </Text>

                    <TextInput
                      editable={!isSavingEdit}
                      maxLength={120}
                      multiline
                      onBlur={onBlur}
                      onChangeText={onChange}
                      placeholder="For example: lunch"
                      placeholderTextColor={
                        theme.textSecondary
                      }
                      style={[
                        styles.input,
                        styles.descriptionInput,
                        {
                          backgroundColor:
                            theme.backgroundElement,
                          color: theme.text,
                        },
                      ]}
                      textAlignVertical="top"
                      value={value}
                    />

                    {fieldState.error?.message ? (
                      <Text style={styles.fieldError}>
                        {fieldState.error.message}
                      </Text>
                    ) : null}
                  </View>
                )}
              />

              <View
                style={[
                  styles.dateBox,
                  {
                    backgroundColor:
                      theme.backgroundElement,
                  },
                ]}
              >
                <Text
                  style={{ color: theme.textSecondary }}
                >
                  Transaction date
                </Text>

                <Text style={{ color: theme.text }}>
                  {selectedTransaction
                    ? new Date(
                        selectedTransaction.transactionDate,
                      ).toLocaleString("en-LK")
                    : ""}
                </Text>
              </View>

              <View style={styles.reviewedRow}>
                <View style={styles.reviewedText}>
                  <Text style={{ color: theme.text }}>
                    Reviewed
                  </Text>
                  <Text
                    style={{ color: theme.textSecondary }}
                  >
                    Mark this entry as checked.
                  </Text>
                </View>

                <Switch
                  disabled={isSavingEdit}
                  onValueChange={setEditedReviewed}
                  value={editedReviewed}
                />
              </View>

              {editError ? (
                <Text style={styles.fieldError}>
                  {editError}
                </Text>
              ) : null}

              <View style={styles.modalActions}>
                <Pressable
                  disabled={isSavingEdit}
                  onPress={closeEditForm}
                  style={[
                    styles.modalActionButton,
                    styles.cancelButton,
                    {
                      borderColor: theme.textSecondary,
                      opacity: isSavingEdit ? 0.55 : 1,
                    },
                  ]}
                >
                  <Text style={{ color: theme.text }}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  disabled={isSavingEdit}
                  onPress={() => {
                    void handleEditSubmit(
                      saveTransactionEdits,
                    )();
                  }}
                  style={[
                    styles.modalActionButton,
                    styles.saveButton,
                    isSavingEdit && styles.disabledButton,
                  ]}
                >
                  <Text style={styles.saveButtonText}>
                    {isSavingEdit
                      ? "Saving..."
                      : "Save changes"}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
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

  transactionActions: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: 6,
  },

  secondaryButton: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },

  secondaryButtonText: {
    fontWeight: "700",
  },

  deleteButton: {
    backgroundColor: "#DC2626",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },

  deleteButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
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

  modalBackdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    flex: 1,
    justifyContent: "flex-end",
  },

  modalCard: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: "92%",
  },

  modalContent: {
    gap: 18,
    padding: 20,
    paddingBottom: 36,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
  },

  formField: {
    gap: 8,
  },

  segmentedControl: {
    flexDirection: "row",
    gap: 8,
  },

  segment: {
    alignItems: "center",
    borderRadius: 10,
    flex: 1,
    padding: 14,
  },

  input: {
    borderColor: "#9CA3AF",
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
    padding: 14,
  },

  descriptionInput: {
    minHeight: 92,
  },

  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  categoryChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  dateBox: {
    borderRadius: 10,
    gap: 6,
    padding: 14,
  },

  reviewedRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  reviewedText: {
    flex: 1,
    gap: 4,
    paddingRight: 16,
  },

  modalActions: {
    flexDirection: "row",
    gap: 10,
  },

  modalActionButton: {
    alignItems: "center",
    borderRadius: 10,
    flex: 1,
    padding: 14,
  },

  cancelButton: {
    borderWidth: 1,
  },

  saveButton: {
    backgroundColor: "#2563EB",
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  disabledButton: {
    opacity: 0.55,
  },

  fieldError: {
    color: "#DC2626",
  },
});
