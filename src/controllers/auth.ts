import { Controller } from "../types/types";

export const signInGetController: Controller = (_, res) => {
  res.render("signin", { pageTitle: "Sign In" });
};

export const signUpGetController: Controller = (_, res) => {
  res.render("signup", { pageTitle: "Sign Up" });
};
