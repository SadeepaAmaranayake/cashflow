import { Router } from "express";
import {
  login,
  register,
} from "../controllers/auth.controller.js";
import { requireAuthentication } from "../middleware/auth.middleware.js";

const authRouter = Router();

// Public routes

authRouter.post("/register", register);
authRouter.post("/login", login);

// Protected route

authRouter.get(
  "/me",
  requireAuthentication,
  (request, response) => {
    if (!request.auth) {
      response.status(401).json({
        status: "error",
        message: "Unauthorized",
      });

      return;
    }

    response.status(200).json({
      userId: request.auth.userId,
    });
  },
);


export default authRouter;