import { z } from "zod";

const monthSchema = z
  .string()
  .regex(/^\d+$/, "Month must be a whole number")
  .transform(Number)
  .pipe(
    z
      .number()
      .int()
      .min(1)
      .max(12),
  );

const yearSchema = z
  .string()
  .regex(/^\d+$/, "Year must be a whole number")
  .transform(Number)
  .pipe(
    z
      .number()
      .int()
      .min(2000)
      .max(2100),
  );

export const monthlyReportQuerySchema =
  z
    .object({
      month: monthSchema,
      year: yearSchema,
    })
    .strict();