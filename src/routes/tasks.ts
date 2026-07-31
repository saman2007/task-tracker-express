import express from "express";

import { getTasksPage } from "../controllers/tasks";

const tasksRouter = express.Router();

tasksRouter.get("/tasks", getTasksPage);

export default tasksRouter;
