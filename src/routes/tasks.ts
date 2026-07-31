import express from "express";

import {
  addTaskPostController,
  tasksGetController,
  addTaskGetController,
} from "../controllers/tasks";

const tasksRouter = express.Router();

tasksRouter.get("/tasks", tasksGetController);
tasksRouter.get("/tasks/add", addTaskGetController);
tasksRouter.post("/tasks/add", addTaskPostController);

export default tasksRouter;
