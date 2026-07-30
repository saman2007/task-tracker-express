import { Controller } from "../types/types";

export const getNotFoundPage: Controller = (_, res) => {
  res.render("404", { pageTitle: "404" });
};
