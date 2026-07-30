import { Controller } from "../types/types";

export const getAddTaskPage: Controller = (_, res) => {
  res.render("add-task", { pageTitle: "Add Task" });
};
