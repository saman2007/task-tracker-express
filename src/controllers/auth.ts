import bcrypt from "bcrypt";

import { User } from "../models/index";
import { Controller } from "../types/types";
import {
  signInSchema,
  SignInSchemaData,
} from "../utils/validations/signInSchema.shared";
import {
  signUpSchema,
  SignUpSchemaData,
} from "../utils/validations/signUpSchema.shared";

export const signInGetController: Controller = async (req, res) => {
  const error = await req.getFlash("error");

  res.render("signin", { pageTitle: "Sign In", error });
};

export const signInPostController: Controller = async (req, res, next) => {
  let userData: SignInSchemaData;

  try {
    userData = await signInSchema.parseAsync(req.body);
  } catch (error) {
    await req.setFlash("error", "Wrong data sent.");

    return res.redirect("/signin");
  }

  const user = await User.findOne({
    where: { email: userData.email },
  });

  if (!user) {
    await req.setFlash("error", "Email or password are incorrect.");

    return res.redirect("/signin");
  }

  const isMatch = await bcrypt.compare(userData.password, user.password);

  if (!isMatch) {
    await req.setFlash("error", "Email or password are incorrect.");

    return res.redirect("/signin");
  }

  req.session.cookie.maxAge =
    req.body.rememberMe === "true" ? req.session.cookie.maxAge : undefined;
  req.session.userId = user.id;

  req.session.save((err) => {
    if (err) return next(new Error(err));

    res.redirect("/dashboard");
  });
};

export const signUpGetController: Controller = async (req, res) => {
  const error = await req.getFlash("error");

  res.render("signup", { pageTitle: "Sign Up", error });
};

export const signUpPostController: Controller = async (req, res, next) => {
  let userData: SignUpSchemaData;

  try {
    userData = await signUpSchema.parseAsync(req.body);
  } catch (error) {
    await req.setFlash("error", "Wrong data sent.");

    return res.redirect("/signup");
  }

  const userExists = !!(await User.findOne({
    where: { email: userData.email },
  }));

  if (userExists) {
    await req.setFlash("error", "A user with this email already exists.");

    return res.redirect("/signup");
  }

  const user = await User.create({
    email: userData.email,
    fullname: userData.fullname,
    password: await bcrypt.hash(userData.password, 10),
  });

  req.session.userId = user.id;

  req.session.save((err) => {
    if (err) return next(new Error(err));

    res.redirect("/dashboard");
  });
};

export const logoutController: Controller = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(new Error(err));

    res.redirect("/");
  });
};
