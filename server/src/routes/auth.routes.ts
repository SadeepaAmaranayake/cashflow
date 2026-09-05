import { Router } from "express";
import {
  getCurrentUser,
  login,
  register,
} from "../controllers/auth.controller.js";
import { requireAuthentication } from "../middleware/auth.middleware.js";
import { authenticationRateLimiter } from "../middleware/rate-limit.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const authRouter = Router();

authRouter.post(
  "/register",
  authenticationRateLimiter,
  asyncHandler(register),
);

authRouter.post(
  "/login",
  authenticationRateLimiter,
  asyncHandler(login),
);

authRouter.get(
  "/me",
  requireAuthentication,
  asyncHandler(getCurrentUser),
);

export default authRouter;
