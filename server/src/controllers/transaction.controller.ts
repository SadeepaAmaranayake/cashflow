import type { Request, Response } from "express";
import mongoose, {
  type QueryFilter,
} from "mongoose";
import { AppError } from "../errors/app-error.js";
import {
  TransactionModel,
  type Transaction,
} from "../models/transaction.model.js";
import { listTransactionsQuerySchema,  updateTransactionSchema } from "../validation/transaction.schema.js";


export async function listTransactions(
  request: Request,
  response: Response,
): Promise<void> {
  const userId = request.auth?.userId;

  if (!userId || !mongoose.isValidObjectId(userId)) {
    throw new AppError(401, "Unauthorized");
  }

  const query =
    listTransactionsQuerySchema.parse(request.query);

  const filter: QueryFilter<Transaction> = {
    userId: new mongoose.Types.ObjectId(userId),
  };

  if (query.type !== undefined) {
    filter.type = query.type;
  }

  if (query.year !== undefined) {
    const startMonth =
      query.month !== undefined
        ? query.month - 1
        : 0;

    const startDate = new Date(
      Date.UTC(query.year, startMonth, 1),
    );

    const endDate =
      query.month !== undefined
        ? new Date(
            Date.UTC(
              query.year,
              query.month,
              1,
            ),
          )
        : new Date(
            Date.UTC(query.year + 1, 0, 1),
          );

    filter.transactionDate = {
      $gte: startDate,
      $lt: endDate,
    };
  }

  const skip = (query.page - 1) * query.limit;

  const [transactions, totalItems] =
    await Promise.all([
      TransactionModel.find(filter)
        .sort({
          transactionDate: -1,
          createdAt: -1,
        })
        .skip(skip)
        .limit(query.limit),

      TransactionModel.countDocuments(filter),
    ]);

  const totalPages = Math.ceil(
    totalItems / query.limit,
  );

  const items = transactions.map((transaction) => ({
    id: transaction.id,
    type: transaction.type,
    amountMinor: transaction.amountMinor,
    category: transaction.category,
    description: transaction.description,
    transactionDate: transaction.transactionDate,
    reviewed: transaction.reviewed,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
  }));

  response.status(200).json({
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      totalItems,
      totalPages,
    },
  });
}
const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

function parseTransactionId(
  value: string | string[] | undefined,
): mongoose.Types.ObjectId {
  if (
    typeof value !== "string" ||
    !OBJECT_ID_PATTERN.test(value)
  ) {
    throw new AppError(
      400,
      "Invalid transaction ID",
    );
  }

  return new mongoose.Types.ObjectId(value);
}

function getAuthenticatedUserId(
  request: Request,
): mongoose.Types.ObjectId {
  const userId = request.auth?.userId;

  if (
    !userId ||
    !OBJECT_ID_PATTERN.test(userId)
  ) {
    throw new AppError(401, "Unauthorized");
  }

  return new mongoose.Types.ObjectId(userId);
}
//Mongoose normally attempts to cast IDs during a query.
// A malformed ID can cause a CastError.
// Validating before querying guarantees malformed route IDs become 400.
// A malformed token user ID becomes 401.
// Converting both values once avoids repeated implicit casting.

export async function updateTransaction(
  request: Request,
  response: Response,
): Promise<void> {
  const transactionId = parseTransactionId(
    request.params.id,
  );

  const userId = getAuthenticatedUserId(request);

  const input = updateTransactionSchema.parse(
    request.body,
  );

  const transaction =
    await TransactionModel.findOneAndUpdate(
      {
        _id: transactionId,
        userId,
      },
      {
        $set: input,
      },
      {
        new: true,
        runValidators: true,
      },
    );

  if (!transaction) {
    throw new AppError(
      404,
      "Transaction not found",
    );
  }

  response.status(200).json({
    item: {
      id: transaction.id,
      type: transaction.type,
      amountMinor: transaction.amountMinor,
      category: transaction.category,
      description: transaction.description,
      transactionDate:
        transaction.transactionDate,
      reviewed: transaction.reviewed,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    },
  });
}

export async function deleteTransaction(
  request: Request,
  response: Response,
): Promise<void> {
  const transactionId = parseTransactionId(
    request.params.id,
  );

  const userId = getAuthenticatedUserId(request);

  const transaction =
    await TransactionModel.findOneAndDelete({
      _id: transactionId,
      userId,
    });

  if (!transaction) {
    throw new AppError(
      404,
      "Transaction not found",
    );
  }

  response.status(204).send();
}