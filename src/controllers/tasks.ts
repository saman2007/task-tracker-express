import Task from "../models/task";
import { Controller, Priority } from "../types/types";
import { PRIORITY_FILTERS } from "../utils/constants";

export const getTasksPage: Controller = (req, res) => {
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
