import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must contain at least 2 characters")
      .max(60, "Name must contain at most 60 characters"),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Enter a valid email address"),

    password: z
      .string()
      .min(8, "Password must contain at least 8 characters"),
  })
  .strict();//.strict() rejects request fields not defined in the schema.

export const loginSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Enter a valid email address"),

    password: z
      .string()
      .min(1, "Password is required"),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;