import cors from "cors";
import express from "express";
import helmet from "helmet";
import { AppError } from "./errors/app-error.js";
import { errorHandler } from "./middleware/error.middleware.js";
import authRouter from "./routes/auth.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import transactionRouter from "./routes/transaction.routes.js";
import reportRouter from "./routes/report.routes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10kb" }));

app.get("/api/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
  });
});
 
app.use("/api/auth", authRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/reports", reportRouter);

// 404 handler comes after all real routes.
app.use((_request, _response, next) => {
  next(new AppError(404, "Route not found"));
});

// Error middleware must be registered last.
app.use(errorHandler);

export default app;
