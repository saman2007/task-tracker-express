import express from "express";
import { getDashboardPage } from "../controllers/dashboard";

const dashboardRouter = express.Router();

dashboardRouter.get("/", getDashboardPage);

export default dashboardRouter;
