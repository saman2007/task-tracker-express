import { Controller } from "../types/types";

export const settingsGetController: Controller = async (req, res) => {
  res.render("settings", {
    pageTitle: "Settings",
    currentUser: req.user,
  });
};

