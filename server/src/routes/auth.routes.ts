import { Router } from "express";
import { UserModel } from "../models/user.model.js";
import {
  comparePassword,
  hashPassword,
} from "../utils/password.js";
import { signAccessToken } from "../utils/token.js";
import {
  loginSchema,
  registerSchema,
} from "../validation/auth.schemas.js";
import { register } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/register", async (request, response) => {
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

  const user = await UserModel.create({
    name: input.name,
    email: input.email,
    passwordHash,
  });

  const token = signAccessToken(user.id);

  response.status(201).json({
    status: "success",
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        timezone: user.timezone,
        reminderHour: user.reminderHour,
        reminderMinute: user.reminderMinute,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    },
  });
});

authRouter.post("/login", async (request, response) => {
  const result = loginSchema.safeParse(request.body);

  if (!result.success) {
    response.status(400).json({
      status: "error",
      errors: result.error.flatten(),
    });

    return;
  }

  const input = result.data;

  const user = await UserModel.findOne({
    email: input.email,
  }).select("+passwordHash");

  if (!user || typeof user.passwordHash !== "string") {
  response.status(401).json({
    status: "error",
    message: "Invalid email or password",
  });

  return;
}

  const passwordMatches = await comparePassword(
    input.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    response.status(401).json({
      status: "error",
      message: "Invalid email or password",
    });

    return;
  }

  const token = signAccessToken(user.id);

  response.status(200).json({
    status: "success",
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        timezone: user.timezone,
        reminderHour: user.reminderHour,
        reminderMinute: user.reminderMinute,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    },
  });
});

export default authRouter;