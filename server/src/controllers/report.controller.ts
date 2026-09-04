import type {
  Request,
  Response,
} from "express";
import mongoose from "mongoose";
import { AppError } from "../errors/app-error.js";
import { TransactionModel } from "../models/transaction.model.js";
import { UserModel } from "../models/user.model.js";
import {
  requireValidTimeZone,
} from "../utils/timezone.js";
import { monthlyReportQuerySchema } from "../validation/report.schemas.js";

interface MonthBoundaries {
  timezone: string;
  monthStart: Date;
  nextMonthStart: Date;
}

interface MonthlyReportAggregationResult {
  totals: Array<{
    totalIncomeMinor: number;
    totalExpensesMinor: number;
  }>;

  expensesByCategory: Array<{
    category: string;
    totalMinor: number;
  }>;

  expensesByDay: Array<{
    date: string;
    totalMinor: number;
  }>;
}

const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

export async function getMonthlyReport(
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

  const query = monthlyReportQuerySchema.parse(
    request.query,
  );

  const userId = new mongoose.Types.ObjectId(
    authenticatedUserId,
  );

  const nextMonth =
    query.month === 12 ? 1 : query.month + 1;

  const nextMonthYear =
    query.month === 12
      ? query.year + 1
      : query.year;

  const user = await UserModel.findById(userId)
    .select("timezone")
    .lean();

  if (!user) {
    throw new AppError(401, "Unauthorized");
  }

  const timezone = requireValidTimeZone(
    user.timezone,
  );

  const timezoneExpression = {
    $literal: timezone,
  };

  const [boundaries] =
    await UserModel.aggregate<MonthBoundaries>([
      {
        $match: {
          _id: userId,
        },
      },

      {
        $project: {
          _id: 0,

          timezone: timezoneExpression,

          monthStart: {
            $dateFromParts: {
              year: query.year,
              month: query.month,
              day: 1,
              timezone: timezoneExpression,
            },
          },

          nextMonthStart: {
            $dateFromParts: {
              year: nextMonthYear,
              month: nextMonth,
              day: 1,
              timezone: timezoneExpression,
            },
          },
        },
      },
    ]);

  if (!boundaries) {
    throw new AppError(401, "Unauthorized");
  }

  const [report] =
    await TransactionModel.aggregate<MonthlyReportAggregationResult>(
      [
        {
          $match: {
            userId,

            transactionDate: {
              $gte: boundaries.monthStart,
              $lt: boundaries.nextMonthStart,
            },
          },
        },

        {
          $facet: {
            totals: [
              {
                $group: {
                  _id: null,

                  totalIncomeMinor: {
                    $sum: {
                      $cond: [
                        {
                          $eq: ["$type", "income"],
                        },
                        "$amountMinor",
                        0,
                      ],
                    },
                  },

                  totalExpensesMinor: {
                    $sum: {
                      $cond: [
                        {
                          $eq: ["$type", "expense"],
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
                  totalIncomeMinor: 1,
                  totalExpensesMinor: 1,
                },
              },
            ],

            expensesByCategory: [
              {
                $match: {
                  type: "expense",
                },
              },

              {
                $group: {
                  _id: "$category",
                  totalMinor: {
                    $sum: "$amountMinor",
                  },
                },
              },

              {
                $sort: {
                  totalMinor: -1,
                  _id: 1,
                },
              },

              {
                $project: {
                  _id: 0,
                  category: "$_id",
                  totalMinor: 1,
                },
              },
            ],

            expensesByDay: [
              {
                $match: {
                  type: "expense",
                },
              },

              {
                $group: {
                  _id: {
                    $dateTrunc: {
                      date: "$transactionDate",
                      unit: "day",
                      timezone:
                        boundaries.timezone,
                    },
                  },

                  totalMinor: {
                    $sum: "$amountMinor",
                  },
                },
              },

              {
                $sort: {
                  _id: 1,
                },
              },

              {
                $project: {
                  _id: 0,

                  date: {
                    $dateToString: {
                      date: "$_id",
                      format: "%Y-%m-%d",
                      timezone:
                        boundaries.timezone,
                    },
                  },

                  totalMinor: 1,
                },
              },
            ],
          },
        },
      ],
    );

  const totals = report?.totals[0];

  const totalIncomeMinor =
    totals?.totalIncomeMinor ?? 0;

  const totalExpensesMinor =
    totals?.totalExpensesMinor ?? 0;

  response.status(200).json({
    month: query.month,
    year: query.year,
    timezone: boundaries.timezone,

    totals: {
      incomeMinor: totalIncomeMinor,
      expensesMinor: totalExpensesMinor,
      netMinor:
        totalIncomeMinor -
        totalExpensesMinor,
    },

    expensesByCategory:
      report?.expensesByCategory ?? [],

    expensesByDay:
      report?.expensesByDay ?? [],
  });
}
