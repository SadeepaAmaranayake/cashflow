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

// as const creates a fixed TypeScript tuple.
// TransactionCategory becomes a union of only the listed values.
// One shared file becomes the source of truth.
// The list can be imported by the Mongoose model and Zod validation.
// Category matching is case-sensitive. "Food" is valid; "food" is not.