import path from "path";

import bcrypt from "bcrypt";
import * as z from "zod";
import pug from "pug";

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
import { sendEmail } from "../utils/smtp";

export const signInGetController: Controller = async (req, res) => {
  const [errors, oldInputs] = await Promise.all([
    req.getFlash("errors"),
    req.getFlash("oldInputs"),
  ]);

  res.render("signin", { pageTitle: "Sign In", errors, oldInputs });
};

export const signInPostController: Controller = async (req, res, next) => {
  let userData: SignInSchemaData;

  try {
    userData = await signInSchema.parseAsync(req.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      await Promise.all([
        req.setFlash(
          "errors",
          error.issues.map(({ message }) => message),
        ),
        req.setFlash("oldInputs", req.body),
      ]);

      return res.redirect("/signin");
    } else {
      return next(error);
    }
  }

  const user = await User.findOne({
    where: { email: userData.email },
  });

  if (!user) {
    await req.setFlash("errors", ["Email or password are incorrect."]);

    return res.redirect("/signin");
  }

  const isMatch = await bcrypt.compare(userData.password, user.password);

  if (!isMatch) {
    await req.setFlash("errors", ["Email or password are incorrect."]);

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
  const [errors, oldInputs] = await Promise.all([
    req.getFlash("errors"),
    req.getFlash("oldInputs"),
  ]);

  res.render("signup", { pageTitle: "Sign Up", errors, oldInputs });
};

export const signUpPostController: Controller = async (req, res, next) => {
  let userData: SignUpSchemaData;

  try {
    userData = await signUpSchema.parseAsync(req.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      await Promise.all([
        req.setFlash(
          "errors",
          error.issues.map(({ message }) => message),
        ),
        req.setFlash("oldInputs", req.body),
      ]);

      return res.redirect("/signup");
    } else {
      return next(error);
    }
  }

  const userExists = !!(await User.findOne({
    where: { email: userData.email },
  }));

  if (userExists) {
    await Promise.all([
      req.setFlash("oldInputs", req.body),
      req.setFlash("errors", ["A user with this email already exists."]),
    ]);

    return res.redirect("/signup");
  }

  const user = await User.create({
    email: userData.email,
    fullname: userData.fullname,
    password: await bcrypt.hash(userData.password, 10),
  });

  sendEmail({
    fromName: "TaskTracker",
    to: userData.email,
    subject: "Welcome to Task Tracker! 🎉",
    html: pug.renderFile(
      path.join(__dirname, "..", "views", "emails", "welcome.pug"),
      {
        fullname: userData.fullname,
        actionUrl: `${process.env.DEPLOY_URL}/dashboard`,
      },
    ),
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
