import User from "../models/user";
import { Controller } from "../types/types";

export const catchAllMiddleware: Controller = async (req, res, next) => {
  const userId = req.session.userId;

  if (userId) {
    res.locals.isLoggedIn = true;

    req.user = (await User.findOne({ where: { id: userId } })) as User;
  } else {
    res.locals.isLoggedIn = false;
  }

  next();
};
