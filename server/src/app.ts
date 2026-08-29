import cors from "cors";//enables cross-origin requests. This allows every origin; restrict it later if needed.
import express from "express";
import helmet from "helmet";//adds common HTTP security headers.

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10kb" }));

app.get("/api/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
  });
});

app.use((_request, response) => {
  response.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

export default app;