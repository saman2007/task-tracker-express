import express from "express";

import {
  addTaskPostController,
  tasksGetController,
  addTaskGetController,
  toggleTaskPostController,
  deleteTaskPostController,
  taskDetailsGetController,
  editTaskGetController,
  editTaskPostController,
} from "../controllers/tasks";

const tasksRouter = express.Router();

tasksRouter.get("/tasks", tasksGetController);
tasksRouter.get("/tasks/add", addTaskGetController);
tasksRouter.post("/tasks/add", addTaskPostController);
tasksRouter.get("/tasks/:id", taskDetailsGetController);
tasksRouter.get("/tasks/:id/edit", editTaskGetController);
tasksRouter.post("/tasks/:id/edit", editTaskPostController);
tasksRouter.post("/tasks/:id/toggle", toggleTaskPostController);
tasksRouter.post("/tasks/:id/delete", deleteTaskPostController);

export default tasksRouter;
