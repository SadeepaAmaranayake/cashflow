import { Router } from "express";
import {
  getCurrentUser,
  login,
  register,
} from "../controllers/auth.controller.js";
import { requireAuthentication } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const authRouter = Router();

authRouter.post(
  "/register",
  asyncHandler(register),
);

authRouter.post(
  "/login",
  asyncHandler(login),
);

authRouter.get(
  "/me",
  requireAuthentication,
  asyncHandler(getCurrentUser),
);

export default authRouter;