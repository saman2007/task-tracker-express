import { Controller } from "../types/types";

export const getDashboardPage: Controller = (_, res) => {
  res.render("dashboard", { pageTitle: "dashboard" });
};
