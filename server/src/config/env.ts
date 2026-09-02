import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z
    .string()
    .refine(
      (value) => Buffer.byteLength(value, "utf8") >= 32,
      "JWT_SECRET must contain at least 32 bytes",
    ),
});

export const env = envSchema.parse(process.env);
