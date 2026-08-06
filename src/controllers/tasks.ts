import Task from "../models/task";
import { Controller, CreateTaskInput } from "../types/types";
import { PRIORITY_FILTERS } from "../utils/constants";

export const tasksGetController: Controller = async (req, res) => {
  const priority = req.query.priority?.toString() || "3";

  if (!PRIORITY_FILTERS.includes(priority)) {
    return res.redirect("/404");
  }

  const tasks = await Task.getTasks(priority);

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
  await Task.create(req.body as CreateTaskInput);

  res.redirect("/tasks");
};

export const toggleTaskPostController: Controller = async (req, res) => {
  const id = req.params.id as string;

  try {
    await Task.toggleTask(+id);

    res.redirect(req.header("referer") || "/tasks");
  } catch (error) {
    res.redirect("/404");
  }
};

export const deleteTaskPostController: Controller = async (req, res) => {
  const id = req.params.id as string;

  try {
    await Task.deleteTask(+id);

    res.redirect("/tasks");
  } catch {
    res.redirect("/404");
  }
};

export const taskDetailsGetController: Controller = async (req, res) => {
  const id = req.params.id as string;

  try {
    const task = await Task.getTask(+id);

    if (!task) throw new Error();

    res.render("task-detail", {
      pageTitle: task.title,
      task,
    });
  } catch (e) {
    return res.redirect("/404");
  }
};

export const editTaskGetController: Controller = async (req, res) => {
  const id = req.params.id as string;

  try {
    const task = await Task.getTask(+id);

    if (!task) throw new Error();

    res.render("add-task", {
      pageTitle: "Edit Task",
      task,
      editing: true,
    });
  } catch (error) {
    res.redirect("/404");
  }
};

export const editTaskPostController: Controller = async (req, res) => {
  const id = req.params.id as string;

  try {
    await Task.updateTask(+id, req.body as CreateTaskInput);

    res.redirect(`/tasks/${id}`);
  } catch (e) {
    res.redirect("/404");
  }
};
