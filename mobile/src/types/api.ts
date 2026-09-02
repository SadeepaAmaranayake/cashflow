import type {
  TransactionCategory,
} from "@/constants/categories";

export type ISODateString = string;

export type TransactionType =
  | "income"
  | "expense";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface UserProfile extends User {
  currency: string;
  timezone: string;
  reminderHour: number;
  reminderMinute: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CurrentUserResponse {
  user: UserProfile;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amountMinor: number;
  category: TransactionCategory;
  description?: string;
  transactionDate: ISODateString;
  reviewed: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface TransactionResponse {
  item: Transaction;
}

export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface TransactionListResponse {
  items: Transaction[];
  pagination: Pagination;
}

export interface DashboardSummary {
  balanceMinor: number;
  currentMonthIncomeMinor: number;
  currentMonthExpensesMinor: number;
  todaySpentMinor: number;
  recentTransactions: Transaction[];
}

export interface MonthlyReport {
  month: number;
  year: number;
  timezone: string;
  totals: {
    incomeMinor: number;
    expensesMinor: number;
    netMinor: number;
  };
  expensesByCategory: {
    category: TransactionCategory;
    totalMinor: number;
  }[];
  expensesByDay: {
    date: string;
    totalMinor: number;
  }[];
}

export interface ValidationErrorDetails {
  formErrors: string[];
  fieldErrors: Record<
    string,
    string[] | undefined
  >;
}

export interface ApiErrorResponse {
  status: "error";
  message: string;
  errors?: ValidationErrorDetails;
}
