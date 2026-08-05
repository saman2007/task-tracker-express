import Task from "../models/task";
import { Controller } from "../types/types";

export const dashboardGetController: Controller = async (_, res) => {
  const [recentTasks, statistic] = await Promise.all([
    Task.findAll({
      limit: 3,
      order: [["createdAt", "DESC"]],
    }),
    Task.getTasksStatistic(),
  ]);

  res.render("dashboard", {
    pageTitle: "Dashboard",
    recentTasks,
    ...statistic,
  });
};
