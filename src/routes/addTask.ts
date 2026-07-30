import express from "express";
import { getAddTaskPage, getAddTaskPost } from "../controllers/addTask";

const addTaskRouter = express.Router();

addTaskRouter.get("/tasks/add", getAddTaskPage);
addTaskRouter.post("/tasks/add", getAddTaskPost);

export default addTaskRouter;
