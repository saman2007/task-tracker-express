import { Task } from "../models/index";
import { Controller } from "../types/types";

export const dashboardGetController: Controller = async (req, res) => {
  const [recentTasks, statistic] = await Promise.all([
    Task.getNewestTasks(req.user!),
    Task.getTasksStatistic(req.user!),
  ]);

  res.render("dashboard", {
    pageTitle: "Dashboard",
    recentTasks,
    ...statistic,
  });
};
