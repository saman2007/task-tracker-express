import bcrypt from "bcrypt";

import User from "../models/user";
import { Controller } from "../types/types";
import { signInSchema } from "../utils/validations/signInSchema.shared";
import { signUpSchema } from "../utils/validations/signUpSchema.shared";

export const signInGetController: Controller = (_, res) => {
  res.render("signin", { pageTitle: "Sign In" });
};

export const signInPostController: Controller = async (req, res) => {
  try {
    const userData = await signInSchema.parseAsync(req.body);

    const user = await User.findOne({
      where: { email: userData.email },
    });

    if (!user) return res.redirect("/signin");

    const isMatch = await bcrypt.compare(userData.password, user.password);
    
    if (!isMatch) return res.redirect("/signin");

    req.session.userId = user.id;

    req.session.save((err) => {
      if (err) throw "Something went wrong.";

      res.redirect("/dashboard");
    });
  } catch (error) {
    console.log(error);

    res.redirect("/signin");
  }
};

export const signUpGetController: Controller = (_, res) => {
  res.render("signup", { pageTitle: "Sign Up" });
};

export const signUpPostController: Controller = async (req, res) => {
  try {
    const userData = await signUpSchema.parseAsync(req.body);

    const userExists = !!(await User.findOne({
      where: { email: userData.email },
    }));

    if (userExists) return res.redirect("/signup");

    const user = await User.create({
      email: userData.email,
      fullname: userData.fullname,
      password: await bcrypt.hash(userData.password, 10),
    });

    req.session.userId = user.id;

    req.session.save((err) => {
      if (err) throw "Something went wrong.";

      res.redirect("/dashboard");
    });
  } catch (error) {
    console.log(error);

    res.redirect("/signup");
  }
};

export const logoutController: Controller = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect("/");
  });
};
