import bcrypt from "bcrypt";

import User from "../models/user";
import { Controller } from "../types/types";
import { signUpSchema } from "../utils/validations/signUpSchema.shared";

export const signInGetController: Controller = (_, res) => {
  res.render("signin", { pageTitle: "Sign In" });
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

    if (!userExists) return res.redirect("/signup");

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
