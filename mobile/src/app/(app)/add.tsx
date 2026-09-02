import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useState } from "react";

import {
  TRANSACTION_CATEGORIES,
} from "@/constants/categories";
import { useTheme } from "@/hooks/use-theme";
import { getApiErrorMessage } from "@/services/api";
import {
  createTransaction,
} from "@/services/transactions";
import {
  transactionFormSchema,
  type TransactionFormValues,
} from "@/validation/transaction";

function getDefaultValues(): TransactionFormValues {
  return {
    type: "expense",
    amount: "",
    category: "Food",
    description: "",
    transactionDate: new Date().toISOString(),
  };
}

export default function AddScreen() {
  const router = useRouter();
  const theme = useTheme();

  const [apiError, setApiError] =
    useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: {
      isSubmitting,
    },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    mode: "onTouched",
    defaultValues: getDefaultValues(),
  });

  const transactionDate = watch("transactionDate");

  async function onSubmit(
    values: TransactionFormValues,
  ): Promise<void> {
    try {
      setApiError(null);

      await createTransaction({
        type: values.type,
        amount: values.amount,
        category: values.category,
        description: values.description,
        transactionDate: values.transactionDate,
      });

      // Reset only after the server confirms success.
      reset(getDefaultValues());

      // Dashboard refetches when it becomes focused.
      router.replace("/");
    } catch (error) {
      // Do not reset here. The user keeps their input and can retry.
      setApiError(getApiErrorMessage(error));
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
      style={[
        styles.screen,
        { backgroundColor: theme.background },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          style={[
            styles.title,
            { color: theme.text },
          ]}
        >
          Add transaction
        </Text>

        <Controller
          control={control}
          name="type"
          render={({
            field: { onChange, value },
          }) => (
            <View style={styles.field}>
              <Text
                style={{ color: theme.text }}
              >
                Type
              </Text>

              <View style={styles.segmentedControl}>
                {(["expense", "income"]).map(
                  (type) => {
                    const isSelected =
                      value === type;

                    return (
                      <Pressable
                        key={type}
                        onPress={() => onChange(type)}
                        style={[
                          styles.segment,
                          {
                            backgroundColor:
                              isSelected
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
          control={control}
          name="amount"
          render={({
            field: {
              onBlur,
              onChange,
              value,
            },
            fieldState,
          }) => (
            <View style={styles.field}>
              <Text
                style={{ color: theme.text }}
              >
                Amount (LKR)
              </Text>

              <TextInput
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
          control={control}
          name="category"
          render={({
            field: { onChange, value },
            fieldState,
          }) => (
            <View style={styles.field}>
              <Text
                style={{ color: theme.text }}
              >
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
                        onPress={() =>
                          onChange(category)
                        }
                        style={[
                          styles.categoryChip,
                          {
                            backgroundColor:
                              isSelected
                                ? "#2563EB"
                                : theme.backgroundElement,
                            borderColor:
                              isSelected
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
          control={control}
          name="description"
          render={({
            field: {
              onBlur,
              onChange,
              value,
            },
            fieldState,
          }) => (
            <View style={styles.field}>
              <Text
                style={{ color: theme.text }}
              >
                Description (optional)
              </Text>

              <TextInput
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
                value={value ?? ""}
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
            Date and time
          </Text>

          <Text
            style={{ color: theme.text }}
          >
            {new Date(
              transactionDate,
            ).toLocaleString("en-LK")}
          </Text>
        </View>

        {apiError ? (
          <Text style={styles.apiError}>
            {apiError}
          </Text>
        ) : null}

        <Pressable
          disabled={isSubmitting}
          onPress={() => handleSubmit(onSubmit)()}
          style={[
            styles.saveButton,
            isSubmitting && styles.disabledButton,
          ]}
        >
          <Text style={styles.saveButtonText}>
            {isSubmitting
              ? "Saving..."
              : "Save transaction"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  content: {
    gap: 18,
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
  },

  field: {
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

  saveButton: {
    alignItems: "center",
    backgroundColor: "#2563EB",
    borderRadius: 10,
    marginTop: 6,
    padding: 16,
  },

  disabledButton: {
    opacity: 0.55,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  fieldError: {
    color: "#DC2626",
  },

  apiError: {
    color: "#DC2626",
    textAlign: "center",
  },
});