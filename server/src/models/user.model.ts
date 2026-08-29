import mongoose, {
  type InferSchemaType,//InferSchemaType and Model remain named imports because they are type-only imports and disappear when TypeScript runs.
  type Model,
} from "mongoose";

const userSchema = new mongoose.Schema(  {
    name: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    currency: {
      type: String,
      default: "LKR",
    },

    timezone: {
      type: String,
      default: "Asia/Colombo",
    },

    reminderHour: {
      type: Number,
      min: 0,
      max: 23,
      default: 21,
      validate: {
        validator: Number.isInteger,
        message: "reminderHour must be an integer",
      },
    },

    reminderMinute: {
      type: Number,
      min: 0,
      max: 59,
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: "reminderMinute must be an integer",
      },
    },
  },
  {
    timestamps: true,//timestamps: true automatically creates and maintains createdAt and updatedAt.

    toJSON: {//The toJSON transformation provides another safeguard when sending a user document through Express.
      transform(_document, returnedObject) {
        const { passwordHash: _passwordHash, ...safeObject } =
          returnedObject as Record<string, unknown>;

        return safeObject;
      },
    },
  },
);

export type User = InferSchemaType<typeof userSchema>;

const existingUserModel = mongoose.models.User as
  | Model<User>
  | undefined;

export const UserModel: Model<User> =
  existingUserModel ?? mongoose.model<User>("User", userSchema);