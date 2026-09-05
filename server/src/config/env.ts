import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce
    .number()
    .int()
    .min(1)
    .max(65_535)
    .default(4000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z
    .string()
    .refine(
      (value) => Buffer.byteLength(value, "utf8") >= 32,
      "JWT_SECRET must contain at least 32 bytes",
    ),
  TRUST_PROXY_HOPS: z.coerce
    .number()
    .int()
    .min(0)
    .max(10)
    .default(0),
  CORS_ORIGINS: z
    .string()
    .trim()
    .optional(),
});

export const env = envSchema.parse(process.env);
