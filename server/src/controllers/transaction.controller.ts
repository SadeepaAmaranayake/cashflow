import type { Request, Response } from "express";
import mongoose, {
  type QueryFilter,
} from "mongoose";
import { AppError } from "../errors/app-error.js";
import {
  TransactionModel,
  type Transaction,
} from "../models/transaction.model.js";
import { listTransactionsQuerySchema } from "../validation/transaction.schema.js";

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