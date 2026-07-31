import { Controller } from "../types/types";

export const notFoundGetController: Controller = (_, res) => {
  res.render("404", { pageTitle: "404" });
};

export const notFoundCatchAllController: Controller = (_, res) => {
  res.redirect("/404");
};
