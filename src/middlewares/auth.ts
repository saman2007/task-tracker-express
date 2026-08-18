import { Controller } from "../types/types";

export const publicRoute: Controller = (req, res, next) => {
  if (req.user) {
    res.redirect("/dashboard");
  } else {
    next();
  }
};

export const privateRoute: Controller = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.redirect("/404");
  }
};
