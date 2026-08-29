import type { Request, Response } from "express";
import { UserModel } from "../models/user.model.js";
import { hashPassword } from "../utils/password.js";
import { signAccessToken } from "../utils/token.js";
import { registerSchema } from "../validation/auth.schemas.js";

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

export async function register(
  request: Request,
  response: Response,
): Promise<void> {
  const result = registerSchema.safeParse(request.body);

  if (!result.success) {
    response.status(400).json({
      status: "error",
      errors: result.error.flatten(),
    });

    return;
  }

  const input = result.data;

  const existingUser = await UserModel.exists({
    email: input.email,
  });

  if (existingUser) {
    response.status(409).json({
      status: "error",
      message: "An account with this email already exists",
    });

    return;
  }

  const passwordHash = await hashPassword(input.password);

  try {
    const user = await UserModel.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    const token = signAccessToken(user.id);

    response.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      response.status(409).json({
        status: "error",
        message: "An account with this email already exists",
      });

      return;
    }

    throw error;
  }
}