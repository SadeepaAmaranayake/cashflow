import type {
  NextFunction,
  Request,
  Response,
} from "express";
import { verifyAccessToken } from "../utils/token.js";

function sendUnauthorized(response: Response): void {
  response.status(401).json({
    status: "error",
    message: "Unauthorized",
  });
}

export function requireAuthentication(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const authorizationHeader = request.get("authorization");//Reads the HTTP Authorization header case-insensitively.

  if (!authorizationHeader) {
    sendUnauthorized(response);
    return;
  }

  const [scheme, token, ...additionalParts] =
    authorizationHeader.trim().split(/\s+/);//Separates the scheme and token while tolerating normal whitespace.

  if (
    scheme?.toLowerCase() !== "bearer" ||//HTTP authentication schemes are case-insensitive, so both Bearer and bearer are accepted.
    !token ||
    additionalParts.length > 0
  ) {
    sendUnauthorized(response);
    return;
  }

  try {
    const payload = verifyAccessToken(token);

    request.auth = {
      userId: payload.userId,
    };

    next();
  } catch {
    sendUnauthorized(response);
  }
}