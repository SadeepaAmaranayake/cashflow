import { z } from "zod";

const BCRYPT_MAX_PASSWORD_BYTES = 72;

function getUtf8ByteLength(value: string): number {
  let byteLength = 0;

  for (const character of value) {
    const codePoint = character.codePointAt(0);

    if (codePoint === undefined) {
      continue;
    }

    if (codePoint <= 0x7f) {
      byteLength += 1;
    } else if (codePoint <= 0x7ff) {
      byteLength += 2;
    } else if (codePoint <= 0xffff) {
      byteLength += 3;
    } else {
      byteLength += 4;
    }
  }

  return byteLength;
}

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
    .min(8, "Password must contain at least 8 characters")
    .refine(
      (password) =>
        getUtf8ByteLength(password) <=
        BCRYPT_MAX_PASSWORD_BYTES,
      "Password must not exceed 72 UTF-8 bytes",
    ),
});

export type LoginFormValues =
  z.infer<typeof loginFormSchema>;

export type RegisterFormValues =
  z.infer<typeof registerFormSchema>;
