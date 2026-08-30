import { Router } from "express";
import { listTransactions } from "../controllers/transaction.controller.js";
import { requireAuthentication } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const transactionRouter = Router();//Protects every transaction route declared after it.do not need to repeat the middleware for every transaction endpoint.

transactionRouter.use(requireAuthentication);

transactionRouter.get(
  "/",
  asyncHandler(listTransactions),
);

export default transactionRouter;