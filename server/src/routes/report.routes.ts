import { Router } from "express";
import { getMonthlyReport } from "../controllers/report.controller.js";
import { requireAuthentication } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const reportRouter = Router();

reportRouter.use(requireAuthentication);

reportRouter.get(
  "/monthly",
  asyncHandler(getMonthlyReport),
);

export default reportRouter;