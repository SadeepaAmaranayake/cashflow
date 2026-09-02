import { z } from "zod";

import {
  TRANSACTION_CATEGORIES,
} from "@/constants/categories";
import { parseMoneyInput } from "@/utils/money";

export const transactionFormSchema = z.object({
  type: z.enum(["income", "expense"]),

  amount: z
    .string()
    .trim()
    .superRefine((value, context) => {
      const result = parseMoneyInput(value);

      if (!result.ok) {
        context.addIssue({
          code: "custom",
          message: result.message,
        });
      }
    }),

  category: z.enum(TRANSACTION_CATEGORIES),

  description: z
  .string()
  .trim()
  .max(
    120,
    "Description must be 120 characters or fewer",
  ),

    transactionDate: z.string().datetime({
      offset: true,
    }),
});

export type TransactionFormValues = z.infer<
  typeof transactionFormSchema
>;