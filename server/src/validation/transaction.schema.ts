import { z } from "zod";
import { TRANSACTION_CATEGORIES } from "../constants/transaction-categories.js";
import { TRANSACTION_TYPES } from "../models/transaction.model.js";

const currentYear = new Date().getUTCFullYear();

export const createTransactionSchema = z
  .object({
    type: z.enum(TRANSACTION_TYPES),

    amount: z
      .string()
      .trim()
      .min(1, "Amount is required"),

    category: z.enum(
      TRANSACTION_CATEGORIES,
    ),

    description: z
      .string()
      .trim()
      .max(120)
      .optional(),

    transactionDate: z.iso
      .datetime({
        offset: true,
      })
      .transform((value) => new Date(value))
      .optional(),
  })
  .strict();

export const listTransactionsQuerySchema = z
  .object({
    page: z.coerce//Query parameters arrive as strings, so z.coerce.number() converts "20" to 20.
      .number()
      .int()
      .min(1)
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .default(20)
      .transform((value) => Math.min(value, 100)),

    type: z
      .enum(TRANSACTION_TYPES)
      .optional(),

    month: z.coerce
      .number()
      .int()
      .min(1)
      .max(12)
      .optional(),

    year: z.coerce
      .number()
      .int()
      .min(2000)
      .max(currentYear + 1)
      .optional(),
  })
  .strict()//.strict() rejects unknown query parameters.
  .superRefine((query, context) => {
    if (
      query.month !== undefined &&
      query.year === undefined
    ) {
      context.addIssue({
        code: "custom",
        path: ["year"],
        message: "Year is required when filtering by month",
      });
    }
  });

export type ListTransactionsQuery = z.infer<
  typeof listTransactionsQuerySchema
>;

export const updateTransactionSchema = z
  .object({
    type: z
      .enum(TRANSACTION_TYPES)
      .optional(),

    amountMinor: z
      .number()
      .refine(
        (value) =>
          Number.isSafeInteger(value) &&
          value > 0,
        "amountMinor must be a positive safe integer",
      )
      .optional(),

    category: z
      .enum(TRANSACTION_CATEGORIES)
      .optional(),

    description: z
      .string()
      .trim()
      .max(120)
      .optional(),

    transactionDate: z.iso
      .datetime({
        offset: true,
      })
      .transform((value) => new Date(value))
      .optional(),

    reviewed: z
      .boolean()
      .optional(),
  })
  .strict()
  .refine(
    (input) => Object.keys(input).length > 0,
    {
      message: "At least one update field is required",
    },
  );

// Every field is optional because PATCH performs a partial update.
// The final .refine() rejects an empty {} body.
// .strict() rejects fields such as userId, _id, createdAt, updatedAt and passwordHash.
// amountMinor must already be an integer. Do not accept decimal money here.
// transactionDate must be an ISO timestamp and is converted into a JavaScript Date.
// Only the six fields required by the specification are accepted.