import { api } from "@/services/api";
import type {
  Transaction,
  TransactionListResponse,
  TransactionResponse,
  TransactionType,
} from "@/types/api";
import type {
  TransactionCategory,
} from "@/constants/categories";
import { parseMoneyInput } from "@/utils/money";

export interface ListTransactionsOptions {
  page?: number;
  limit?: number;
  type?: TransactionType;
  month?: number;
  year?: number;
}

export async function listTransactions(
  options: ListTransactionsOptions,
): Promise<TransactionListResponse> {
  const response =
    await api.get<TransactionListResponse>(
      "/transactions",
      {
        params: options,
      },
    );

  return response.data;
}

export interface CreateTransactionInput {
  type: TransactionType;
  amount: string;
  category: TransactionCategory;
  description?: string;
  transactionDate?: string;
}

export interface UpdateTransactionInput {
  type?: TransactionType;
  amount?: string;
  category?: TransactionCategory;
  description?: string;
  transactionDate?: string;
  reviewed?: boolean;
}

export async function createTransaction(
  input: CreateTransactionInput,
): Promise<Transaction> {
  const parsedAmount = parseMoneyInput(input.amount);

  if (!parsedAmount.ok) {
    throw new Error(parsedAmount.message);
  }

  const response = await api.post<TransactionResponse>(
    "/transactions",
    {
      type: input.type,
      amount: input.amount.trim(),
      category: input.category,
      description: input.description?.trim(),
      transactionDate: input.transactionDate,
    },
  );

  return response.data.item;
}

export async function updateTransaction(
  transactionId: string,
  input: UpdateTransactionInput,
): Promise<Transaction> {
  const requestBody: {
    type?: TransactionType;
    amountMinor?: number;
    category?: TransactionCategory;
    description?: string;
    transactionDate?: string;
    reviewed?: boolean;
  } = {
    type: input.type,
    category: input.category,
    description: input.description?.trim(),
    transactionDate: input.transactionDate,
    reviewed: input.reviewed,
  };

  if (input.amount !== undefined) {
    const parsedAmount = parseMoneyInput(input.amount);

    if (!parsedAmount.ok) {
      throw new Error(parsedAmount.message);
    }

    requestBody.amountMinor =
      parsedAmount.amountMinor;
  }

  const response = await api.patch<TransactionResponse>(
    `/transactions/${transactionId}`,
    requestBody,
  );

  return response.data.item;
}