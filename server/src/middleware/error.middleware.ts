import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";//400 Bad Request
import { AppError } from "../errors/app-error.js";

interface DuplicateKeyError {
  code: number;
}

interface JsonParseError {
  status: number;
  type: string;
}

function isDuplicateKeyError(
  error: unknown,
): error is DuplicateKeyError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000 //MongoDB duplicate-key code 11000 becomes 409 Conflict.
  );
}

function isJsonParseError(
  error: unknown,
): error is SyntaxError & JsonParseError {
  return (
    error instanceof SyntaxError &&
    "status" in error &&
    error.status === 400 &&
    "type" in error &&
    error.type === "entity.parse.failed"
  );
}

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  next,
): void => {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (isJsonParseError(error)) {
    response.status(400).json({
      status: "error",
      message: "Malformed JSON body",
    });

    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: error.flatten(),
    });

    return;
  }

  if (isDuplicateKeyError(error)) {
    response.status(409).json({
      status: "error",
      message: "An account with this email already exists",
    });

    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      status: "error",
      message: error.safeMessage,
    });

    return;
  }

  console.error("Unexpected server error:", error);

  response.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};
