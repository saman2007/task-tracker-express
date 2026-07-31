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
    res.redirect("/tasks/add");
  });
};

export const toggleTaskPostController: Controller = (req, res) => {
  const id = req.params.id as string;

  Task.toggleTask(id, () => {
    res.redirect(req.header("referer") || "/tasks");
  });
};
