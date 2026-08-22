import { Task } from "../models/index";
import { Controller, CreateTaskInput } from "../types/types";
import { PRIORITY_FILTERS } from "../utils/constants";

export const tasksGetController: Controller = async (req, res) => {
  const priority = req.query.priority?.toString() || "3";

  if (!PRIORITY_FILTERS.includes(priority)) {
    return res.redirect("/404");
  }

  const tasks = await Task.getTasks(req.user!, priority);

  res.render("tasks", {
    pageTitle: "All Tasks",
    tasks,
    currentFilter: priority,
  });
};

export const addTaskGetController: Controller = (_, res) => {
  res.render("add-task", { pageTitle: "Add Task" });
};

export const addTaskPostController: Controller = async (req, res) => {
  await req.user!.createTask(req.body as CreateTaskInput);

  res.redirect("/tasks");
};

export const toggleTaskPostController: Controller = async (req, res) => {
  const id = req.params.id as string;

  if (!+id) return res.redirect("/404");

  await Task.toggleTask(+id, req.user!.id);

  res.redirect(req.header("referer") || "/tasks");
};

export const deleteTaskPostController: Controller = async (req, res) => {
  const id = req.params.id as string;

  if (!+id) return res.redirect("/404");

  await Task.deleteTask(+id, req.user!.id);

  res.redirect("/tasks");
};

export const taskDetailsGetController: Controller = async (req, res) => {
  const id = req.params.id as string;

  if (!+id) return res.redirect("/404");

  const task = await Task.getTask(+id, req.user!.id);

  if (!task) return res.redirect("/404");

  res.render("task-detail", {
    pageTitle: task.title,
    task,
  });
};

export const editTaskGetController: Controller = async (req, res) => {
  const id = req.params.id as string;

  if (!+id) return res.redirect("/404");

  const task = await Task.getTask(+id, req.user!.id);

  if (!task) return res.redirect("/404");

  res.render("add-task", {
    pageTitle: "Edit Task",
    task,
    editing: true,
  });
};

export const editTaskPostController: Controller = async (req, res) => {
  const id = req.params.id as string;

  if (!+id) return res.redirect("/404");

  const affectedNumber = await Task.updateTask(
    +id,
    req.body as CreateTaskInput,
    req.user!.id,
  );

  if (affectedNumber === 0) return res.redirect("/404");

  res.redirect(`/tasks/${id}`);
};
