import Task from "../models/task";
import { Controller } from "../types/types";

export const getDashboardPage: Controller = (_, res) => {
  const recentTasks = Task.getRenderingTasks().slice(-3).reverse();

  res.render("dashboard", {
    pageTitle: "Dashboard",
    recentTasks,
    ...Task.getTasksStatistic(),
  });
};
