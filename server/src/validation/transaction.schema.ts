import { z } from "zod";
import { TRANSACTION_TYPES } from "../models/transaction.model.js";

const currentYear = new Date().getUTCFullYear();

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