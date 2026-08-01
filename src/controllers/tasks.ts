import url from "url";

import Task from "../models/task";
import { Controller, CreateTaskInput } from "../types/types";
import { PRIORITY_FILTERS } from "../utils/constants";

export const tasksGetController: Controller = (req, res) => {
  const priority = req.query.priority?.toString() || "3";

  if (!PRIORITY_FILTERS.includes(priority)) {
    return res.redirect("/404");
  }

  res.render("tasks", {
    pageTitle: "All Tasks",
    tasks: Task.getRenderingTasks(priority),
    currentFilter: priority,
  });
};

export const addTaskGetController: Controller = (_, res) => {
  res.render("add-task", { pageTitle: "Add Task" });
};

export const addTaskPostController: Controller = (req, res) => {
  req.body.priority = +req.body.priority;

  const taskData: CreateTaskInput = req.body;

  const task = new Task(taskData.title, taskData.note, taskData.priority);

  Task.addTask(task, (err) => {
    res.redirect(req.header("referer") || "/");
  });
};

export const toggleTaskPostController: Controller = (req, res) => {
  const id = req.params.id as string;

  try {
    Task.toggleTask(id, () => {
      res.redirect(req.header("referer") || "/tasks");
    });
  } catch (error) {
    res.redirect("/404");
  }
};

export const deleteTaskPostController: Controller = (req, res) => {
  const id = req.params.id as string;

  try {
    console.log(req.header("referer"));
    Task.deleteTask(id, () => {
      res.redirect("/tasks");
    });
  } catch {
    res.redirect("/404");
  }
};

export const taskDetailsGetController: Controller = (req, res) => {
  const id = req.params.id as string;

  const task = Task.findTaskById(id).task;

  if (!task) {
    return res.redirect("/404");
  }

  res.render("task-detail", {
    pageTitle: task.title,
    task: Task.toRenderingTask(task),
  });
};

export const editTaskGetController: Controller = (req, res) => {
  const id = req.params.id as string;

  const task = Task.findTaskById(id).task;

  if (!task) {
    return res.redirect("/404");
  }
  console.log("here");
  res.render("add-task", {
    pageTitle: "Edit Task",
    task,
    editing: true,
  });
};
