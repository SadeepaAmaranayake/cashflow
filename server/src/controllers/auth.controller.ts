import type { Request, Response } from "express";
import mongoose from "mongoose";
import { AppError } from "../errors/app-error.js";
import { UserModel } from "../models/user.model.js";
import {
  comparePassword,
  hashPassword,
} from "../utils/password.js";
import { signAccessToken } from "../utils/token.js";
import {
  requireValidTimeZone,
} from "../utils/timezone.js";
import {
  loginSchema,
  registerSchema,
} from "../validation/auth.schemas.js";

export async function register(
  request: Request,
  response: Response,
): Promise<void> {
  const input = registerSchema.parse(request.body);

  const existingUser = await UserModel.exists({
    email: input.email,
  });

  if (existingUser) {
    throw new AppError(
      409,
      "An account with this email already exists",
    );
  }

  const passwordHash = await hashPassword(input.password);

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
}

export async function login(
  request: Request,
  response: Response,
): Promise<void> {
  const input = loginSchema.parse(request.body);

  const user = await UserModel.findOne({
    email: input.email,
  }).select("+passwordHash");

  if (!user || typeof user.passwordHash !== "string") {
    throw new AppError(401, "Invalid credentials");
  }

  const passwordMatches = await comparePassword(
    input.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new AppError(401, "Invalid credentials");
  }

  const token = signAccessToken(user.id);

  response.status(200).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
}

export async function getCurrentUser(
  request: Request,
  response: Response,
): Promise<void> {
  const userId = request.auth?.userId;

  if (!userId || !mongoose.isValidObjectId(userId)) {
    throw new AppError(401, "Unauthorized");
  }

  const user = await UserModel.findById(userId).select(
    [
      "name",
      "email",
      "currency",
      "timezone",
      "reminderHour",
      "reminderMinute",
      "createdAt",
      "updatedAt",
    ].join(" "),
  );

  if (!user) {
    throw new AppError(401, "Unauthorized");
  }

  response.status(200).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      timezone: requireValidTimeZone(
        user.timezone,
      ),
      reminderHour: user.reminderHour,
      reminderMinute: user.reminderMinute,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
}
