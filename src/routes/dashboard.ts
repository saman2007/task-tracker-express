import express from "express";

import { dashboardGetController } from "../controllers/dashboard";

const dashboardRouter = express.Router();

dashboardRouter.get("/", dashboardGetController);

export default dashboardRouter;
