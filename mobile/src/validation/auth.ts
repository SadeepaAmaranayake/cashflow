import { z } from "zod";

export const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required"),
});

export const registerFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(60, "Name must contain at most 60 characters"),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address"),

  password: z
    .string()
    .min(8, "Password must contain at least 8 characters"),
});

export type LoginFormValues =
  z.infer<typeof loginFormSchema>;

export type RegisterFormValues =
  z.infer<typeof registerFormSchema>;