import express from "express";
import { getAddTaskPage } from "../controllers/addTask";

const addTaskRouter = express.Router();

addTaskRouter.get("/tasks/add", getAddTaskPage);

export default addTaskRouter;
