import express from "express";

import {
  addTaskPostController,
  tasksGetController,
  addTaskGetController,
  toggleTaskPostController,
  deleteTaskPostController,
} from "../controllers/tasks";

const tasksRouter = express.Router();

tasksRouter.get("/tasks", tasksGetController);
tasksRouter.get("/tasks/add", addTaskGetController);
tasksRouter.post("/tasks/add", addTaskPostController);
tasksRouter.post("/tasks/:id/toggle", toggleTaskPostController);
tasksRouter.post("/tasks/:id/delete", deleteTaskPostController);

export default tasksRouter;
