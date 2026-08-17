import express from "express";

import { dashboardGetController } from "../controllers/dashboard";

const dashboardRouter = express.Router();

dashboardRouter.get("/dashboard", dashboardGetController);

export default dashboardRouter;
