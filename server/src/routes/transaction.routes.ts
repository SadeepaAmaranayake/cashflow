import { Router } from "express";
import {
  deleteTransaction,
  listTransactions,
  updateTransaction,
} from "../controllers/transaction.controller.js";
import { requireAuthentication } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const transactionRouter = Router();

transactionRouter.use(requireAuthentication);

transactionRouter.get(
  "/",
  asyncHandler(listTransactions),
);

transactionRouter.patch(
  "/:id",
  asyncHandler(updateTransaction),
);

transactionRouter.delete(
  "/:id",
  asyncHandler(deleteTransaction),
);

export default transactionRouter;