import * as z from "zod";

import { Task } from "../models/index";
import { Controller, CreateTaskInput } from "../types/types";
import { PRIORITY_FILTERS } from "../utils/constants";
import { taskSchema } from "../utils/validations/taskSchema.shared";

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

export const addTaskGetController: Controller = async (req, res) => {
  const [errors, oldInputs] = await Promise.all([
    req.getFlash("errors"),
    req.getFlash("oldInputs"),
  ]);

  res.render("add-task", { pageTitle: "Add Task", errors, oldInputs });
};

export const addTaskPostController: Controller = async (req, res, next) => {
  let data: CreateTaskInput;

  try {
    data = await taskSchema.parseAsync(req.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      await Promise.all([
        req.setFlash(
          "errors",
          error.issues.map(({ message }) => message),
        ),
        req.setFlash("oldInputs", req.body),
      ]);

      return res.redirect("/tasks/add");
    } else return next(error);
  }

  await req.user!.createTask(data);

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

  const [errors, oldInputs] = await Promise.all([
    req.getFlash("errors"),
    req.getFlash("oldInputs"),
  ]);

  res.render("add-task", {
    pageTitle: "Edit Task",
    task,
    editing: true,
    errors,
    oldInputs,
  });
};

export const editTaskPostController: Controller = async (req, res, next) => {
  const id = req.params.id as string;

  if (!+id) return res.redirect("/404");

  let data: CreateTaskInput;

  try {
    data = await taskSchema.parseAsync(req.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      await Promise.all([
        req.setFlash(
          "errors",
          error.issues.map(({ message }) => message),
        ),
        req.setFlash("oldInputs", req.body),
      ]);

      return res.redirect(`/tasks/${id}/edit`);
    } else return next(error);
  }

  const affectedNumber = await Task.updateTask(+id, data, req.user!.id);

  if (affectedNumber === 0) return res.redirect("/404");

  res.redirect(`/tasks/${id}`);
};
