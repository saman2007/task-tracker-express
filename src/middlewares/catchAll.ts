import User from "../models/user";
import { Controller } from "../types/types";

export const catchAllMiddleware: Controller = async (req, res, next) => {
  const userId = req.session.userId;

  if (userId) {
    const user = (await User.findOne({ where: { id: userId } })) as User;
    if (user) {
      res.locals.isLoggedIn = true;
      req.user = user;
      res.locals.currentUser = user;
    } else {
      res.locals.isLoggedIn = false;
      res.locals.currentUser = null;
    }
  } else {
    res.locals.isLoggedIn = false;
    res.locals.currentUser = null;
  }

  next();
};
