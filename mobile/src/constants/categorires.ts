export const TRANSACTION_CATEGORIES = [
  "Food",
  "Transport",
  "Boarding",
  "Education",
  "Mobile/Data",
  "Entertainment",
  "Health",
  "Shopping",
  "Other",
] as const;

export type TransactionCategory =
  (typeof TRANSACTION_CATEGORIES)[number];