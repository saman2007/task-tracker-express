import Task from "../models/task";
import { Controller, Priority } from "../types/types";
import { TASK_FILTERS } from "../utils/constants";
import { getDateByISOString, getTimeByISOString } from "../utils/utils";

export const getTasksPage: Controller = (req, res) => {
  const priority = req.query.priority?.toString() || "3";

  if (!(priority in Priority) && priority !== "3") {
    return res.redirect("/404");
  }

  const priorityNumber = +priority;
  let tasks = Task.getTasks();

  if (priorityNumber !== 3) {
    tasks = tasks.filter(({ priority }) => priority === priorityNumber);
  }

  const renderingTasks = tasks.map(({ createdAt, ...other }) => ({
    ...other,
    createdAt,
    date: getDateByISOString(createdAt),
    time: getTimeByISOString(createdAt),
  }));

  res.render("tasks", {
    pageTitle: "All Tasks",
    tasks: renderingTasks,
    currentFilter: priority,
  });
};
