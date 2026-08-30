import { Router } from "express";
import { getDashboardSummary } from "../controllers/dashboard.controller.js";
import { requireAuthentication } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const dashboardRouter = Router();

dashboardRouter.use(requireAuthentication);

dashboardRouter.get(
  "/summary",
  asyncHandler(getDashboardSummary),
);

export default dashboardRouter;