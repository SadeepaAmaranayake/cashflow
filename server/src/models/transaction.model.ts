import mongoose, { type Model } from "mongoose";
import {
  TRANSACTION_CATEGORIES,
  type TransactionCategory,
} from "../constants/transaction-categories.js";
import { MAX_AMOUNT_MINOR } from "../constants/money.js";

export const TRANSACTION_TYPES = [
  "income",
  "expense",
] as const;

export type TransactionType =
  (typeof TRANSACTION_TYPES)[number];

export interface Transaction {
  userId: mongoose.Types.ObjectId;
  type: TransactionType;
  amountMinor: number;
  category: TransactionCategory;
  description?: string;
  transactionDate: Date;
  reviewed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new mongoose.Schema<Transaction>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    type: {
      type: String,
      required: true,
      enum: [...TRANSACTION_TYPES],
    },

    amountMinor: {
      type: Number,
      required: true,
      min: [1, "Amount must be greater than zero"],
      max: [
        MAX_AMOUNT_MINOR,
        "Amount exceeds the maximum allowed value",
      ],
      validate: {
        validator(value: number): boolean {
          return Number.isSafeInteger(value);
        },
        message: "Amount must be a safe integer",
      },
    },

    category: {
      type: String,
      required: true,
      enum: {
        values: [...TRANSACTION_CATEGORIES],
        message: "{VALUE} is not an allowed transaction category",
      },
    },

    description: {
      type: String,
      trim: true,
      maxlength: 120,
    },

    transactionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    reviewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

transactionSchema.index({
  userId: 1,
  transactionDate: -1,
});

transactionSchema.index({
  userId: 1,
  type: 1,
  transactionDate: -1,
});

const existingTransactionModel =
  mongoose.models.Transaction as
    | Model<Transaction>
    | undefined;

export const TransactionModel: Model<Transaction> =
  existingTransactionModel ??
  mongoose.model<Transaction>(
    "Transaction",
    transactionSchema,
  );
