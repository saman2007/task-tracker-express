import Task from "../models/task";
import { Controller, CreateTaskInput, Priority } from "../types/types";

export const getAddTaskPage: Controller = (_, res) => {
  res.render("add-task", { pageTitle: "Add Task" });
};

export const getAddTaskPost: Controller = (req, res) => {
  req.body.priority = +req.body.priority;

  const taskData: CreateTaskInput = req.body;

  const task = new Task(taskData.title, taskData.note, taskData.priority);

  Task.addTask(task, (err) => {
    res.redirect("/tasks/add");
  });
};
