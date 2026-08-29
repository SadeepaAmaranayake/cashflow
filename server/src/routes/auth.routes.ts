import { Router } from "express";
import { registerSchema } from "../validation/auth.schemas.js";

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

  // Continue registration here:
  // 1. Check whether the email already exists.
  // 2. Hash input.password.
  // 3. Save the user using passwordHash.
  // 4. Return the new user without its password hash.
});

export default authRouter;