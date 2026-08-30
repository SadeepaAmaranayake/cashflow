import type {
  Request,
  Response,
} from "express";
import mongoose from "mongoose";
import { AppError } from "../errors/app-error.js";
import { TransactionModel } from "../models/transaction.model.js";
import { UserModel } from "../models/user.model.js";

interface DashboardTotals {
  balanceMinor: number;
  currentMonthIncomeMinor: number;
  currentMonthExpensesMinor: number;
  todaySpentMinor: number;
}

interface DashboardAggregationResult {
  totals: DashboardTotals[];

  recentTransactions: Array<{
    id: string;
    type: "income" | "expense";
    amountMinor: number;
    category: string;
    description?: string;
    transactionDate: Date;
    reviewed: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

export async function getDashboardSummary(
  request: Request,
  response: Response,
): Promise<void> {
  const authenticatedUserId =
    request.auth?.userId;

  if (
    !authenticatedUserId ||
    !OBJECT_ID_PATTERN.test(authenticatedUserId)
  ) {
    throw new AppError(401, "Unauthorized");
  }

  const userId = new mongoose.Types.ObjectId(
    authenticatedUserId,
  );

  const user = await UserModel.findById(userId)
    .select("timezone")
    .lean();

  if (!user) {
    throw new AppError(401, "Unauthorized");
  }

  const timezone =
    user.timezone || "Asia/Colombo";

  const [dashboard] =
    await TransactionModel.aggregate<DashboardAggregationResult>(
      [
        {
          $match: {
            userId,
          },
        },

        {
          $set: {
            monthStart: {
              $dateTrunc: {
                date: "$$NOW",
                unit: "month",
                timezone,
              },
            },

            todayStart: {
              $dateTrunc: {
                date: "$$NOW",
                unit: "day",
                timezone,
              },
            },
          },
        },

        {
          $set: {
            nextMonthStart: {
              $dateAdd: {
                startDate: "$monthStart",
                unit: "month",
                amount: 1,
                timezone,
              },
            },

            tomorrowStart: {
              $dateAdd: {
                startDate: "$todayStart",
                unit: "day",
                amount: 1,
                timezone,
              },
            },
          },
        },

        {
          $facet: {
            totals: [
              {
                $group: {
                  _id: null,

                  balanceMinor: {
                    $sum: {
                      $cond: [
                        {
                          $eq: ["$type", "income"],
                        },
                        "$amountMinor",
                        {
                          $multiply: [
                            "$amountMinor",
                            -1,
                          ],
                        },
                      ],
                    },
                  },

                  currentMonthIncomeMinor: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            {
                              $eq: [
                                "$type",
                                "income",
                              ],
                            },
                            {
                              $gte: [
                                "$transactionDate",
                                "$monthStart",
                              ],
                            },
                            {
                              $lt: [
                                "$transactionDate",
                                "$nextMonthStart",
                              ],
                            },
                          ],
                        },
                        "$amountMinor",
                        0,
                      ],
                    },
                  },

                  currentMonthExpensesMinor: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            {
                              $eq: [
                                "$type",
                                "expense",
                              ],
                            },
                            {
                              $gte: [
                                "$transactionDate",
                                "$monthStart",
                              ],
                            },
                            {
                              $lt: [
                                "$transactionDate",
                                "$nextMonthStart",
                              ],
                            },
                          ],
                        },
                        "$amountMinor",
                        0,
                      ],
                    },
                  },

                  todaySpentMinor: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            {
                              $eq: [
                                "$type",
                                "expense",
                              ],
                            },
                            {
                              $gte: [
                                "$transactionDate",
                                "$todayStart",
                              ],
                            },
                            {
                              $lt: [
                                "$transactionDate",
                                "$tomorrowStart",
                              ],
                            },
                          ],
                        },
                        "$amountMinor",
                        0,
                      ],
                    },
                  },
                },
              },

              {
                $project: {
                  _id: 0,
                },
              },
            ],

            recentTransactions: [
              {
                $sort: {
                  transactionDate: -1,
                  createdAt: -1,
                },
              },

              {
                $limit: 5,
              },

              {
                $project: {
                  _id: 0,
                  id: {
                    $toString: "$_id",
                  },
                  type: 1,
                  amountMinor: 1,
                  category: 1,
                  description: 1,
                  transactionDate: 1,
                  reviewed: 1,
                  createdAt: 1,
                  updatedAt: 1,
                },
              },
            ],
          },
        },
      ],
    );

  const totals = dashboard?.totals[0] ?? {
    balanceMinor: 0,
    currentMonthIncomeMinor: 0,
    currentMonthExpensesMinor: 0,
    todaySpentMinor: 0,
  };

  response.status(200).json({
    balanceMinor: totals.balanceMinor,
    currentMonthIncomeMinor:
      totals.currentMonthIncomeMinor,
    currentMonthExpensesMinor:
      totals.currentMonthExpensesMinor,
    todaySpentMinor: totals.todaySpentMinor,
    recentTransactions:
      dashboard?.recentTransactions ?? [],
  });
}

//$match: { userId } is first so one user can never see another user’s financial data.
// The user’s timezone defines “today” and “current month.” Server time is not reliable for this.
// $$NOW is MongoDB’s current time and remains consistent throughout the aggregation.
// $dateTrunc finds the start of the current day and month in the selected timezone.
// $facet calculates totals and recent transactions within one database operation.
// All calculations use amountMinor, so no decimal-money calculations occur.
// Missing transactions produce zero totals instead of undefined.
//The balance includes all transactions because your requirement defines it as all income minus all expenses.