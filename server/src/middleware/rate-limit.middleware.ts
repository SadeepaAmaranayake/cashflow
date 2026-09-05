import { rateLimit } from "express-rate-limit";

export const authenticationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    status: "error",
    message:
      "Too many authentication attempts. Try again later.",
  },
});
