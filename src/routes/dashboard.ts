import express from "express";

import { dashboardGetController } from "../controllers/dashboard";
import { privateRoute } from "../middlewares/auth";

const dashboardRouter = express.Router();

dashboardRouter.get("/dashboard", privateRoute, dashboardGetController);

export default dashboardRouter;
