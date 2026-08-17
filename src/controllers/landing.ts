import { Controller } from "../types/types";

export const landingGetController: Controller = (_, res) => {
  res.render("landing", { pageTitle: "Landing" });
};
