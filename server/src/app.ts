import cors from "cors";//enables cross-origin requests. This allows every origin; restrict it later if needed.
import express from "express";
import helmet from "helmet";//adds common HTTP security headers.
import { AppError } from "./errors/app-error.js";
import { errorHandler } from "./middleware/error.middleware.js";
import authRouter from "./routes/auth.routes.js";
import transactionRouter from "./routes/transaction.routes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10kb" }));

app.use("/api/auth", authRouter);

app.get("/api/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
  });
});

// Runs only when no real route matched.
app.use((_request, _response, next) => {
  next(new AppError(404, "Route not found"));
});

// Error middleware must be last.
app.use(errorHandler);


export default app;