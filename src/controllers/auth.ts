import path from "path";
import crypto from "crypto";

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
import {
  resetPasswordSchema,
  ResetPasswordSchemaData,
} from "../utils/validations/resetPasswordSchema.shared";
import {
  setNewPasswordSchema,
  SetNewPasswordSchemaData,
} from "../utils/validations/setNewPasswordSchema.shared";
import { generateToken, hashStr } from "../utils/utils";
import { sendWelcomeEmail } from "../utils/emailSenders";

export const signInGetController: Controller = async (req, res) => {
  const [errors, oldInputs, success] = await Promise.all([
    req.getFlash("errors"),
    req.getFlash("oldInputs"),
    req.getFlash("success"),
  ]);

  res.render("signin", { pageTitle: "Sign In", errors, oldInputs, success });
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

  if (!user.isAccountVerified) {
    await req.setFlash("errors", [
      "Your account isn't verified yet. Please check your inbox or request a new link.",
    ]);

    await req.setFlash("oldInputs", { email: user.email } as any);

    return res.redirect(`/account/verify-account?email=${user.email}`);
  }

  req.session.regenerate((err) => {
    if (err) return next(new Error(err));

    if (req.body.rememberMe === "true") {
      req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30;
    } else {
      req.session.cookie.maxAge = undefined;
    }

    req.session.userId = user.id;

    req.session.save((err) => {
      if (err) return next(new Error(err));

      res.redirect("/dashboard");
    });
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

  const emailActionToken = await generateToken(32);

  const user = await User.create({
    email: userData.email,
    fullname: userData.fullname,
    password: await hashStr(userData.password),
    emailActionToken: await hashStr(emailActionToken),
    emailActionExp: new Date(Date.now() + 1000 * 60 * 60 * 24),
  });

  sendWelcomeEmail(user.email, {
    fullname: user.fullname,
    token: emailActionToken,
  });

  res.redirect(`/account/verify-account?email=${user.email}&success=true`);
};

export const logoutPostController: Controller = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(new Error(err));

    res.redirect("/");
  });
};

export const resetPasswordRequestGetController: Controller = async (
  req,
  res,
) => {
  const [errors, oldInputs, success] = await Promise.all([
    req.getFlash("errors"),
    req.getFlash("oldInputs"),
    req.getFlash("success"),
  ]);

  res.render("reset-password", {
    pageTitle: "Password Reset Request",
    errors,
    oldInputs,
    success,
  });
};

export const resetPasswordRequestPostController: Controller = async (
  req,
  res,
  next,
) => {
  let data: ResetPasswordSchemaData;

  try {
    data = await resetPasswordSchema.parseAsync(req.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      await Promise.all([
        req.setFlash(
          "errors",
          error.issues.map(({ message }) => message),
        ),
        req.setFlash("oldInputs", req.body),
      ]);

      return res.redirect("/reset-password");
    } else {
      return next(error);
    }
  }

  const user = await User.findOne({ where: { email: data.email } });

  if (!user) {
    await req.setFlash("errors", ["No user with this email exists."]);

    return res.redirect("/reset-password");
  }

  crypto.randomBytes(32, async (err, buff) => {
    if (err) return next(err);

    const token = buff.toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpiration = new Date(Date.now() + 3600 * 1000);

    await user.save();

    await req.setFlash("success", [
      "An email with reset password will be sent to you.",
    ]);

    res.redirect("/reset-password");
  });
};

export const resetPasswordGetController: Controller = async (req, res) => {
  const token = req.params.token as string;

  const user = await User.findOne({ where: { resetPasswordToken: token } });

  if (!user) {
    await req.setFlash("errors", [
      "Reset password link is expired or used. Please send a new request.",
    ]);

    return res.redirect("/reset-password");
  }

  if (user.resetPasswordExpiration! < new Date()) {
    await req.setFlash("errors", [
      "Reset password link is expired. Please send your request again.",
    ]);

    return res.redirect("/reset-password");
  }

  res.render("set-new-password", { pageTitle: "Reset Password", token });
};

export const resetPasswordPostController: Controller = async (
  req,
  res,
  next,
) => {
  const token = req.params.token as string;

  let data: SetNewPasswordSchemaData;

  //TODO: refactor validation checks. Convert the checking logic to a separate middleware or something like that.
  try {
    data = await setNewPasswordSchema.parseAsync(req.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      await Promise.all([
        req.setFlash(
          "errors",
          error.issues.map(({ message }) => message),
        ),
        req.setFlash("oldInputs", req.body),
      ]);

      return res.redirect(`/reset-password/${token}`);
    } else {
      return next(error);
    }
  }

  const user = await User.findOne({ where: { resetPasswordToken: token } });

  if (!user) {
    await req.setFlash("errors", [
      "Reset password link is expired or used. Please send a new request.",
    ]);

    return res.redirect("/reset-password");
  }

  if (user.resetPasswordExpiration! < new Date()) {
    await req.setFlash("errors", [
      "Reset password link is expired. Please send your request again.",
    ]);

    user.resetPasswordToken = null;
    user.resetPasswordExpiration = null;

    await user.save();

    return res.redirect("/reset-password");
  }

  user.resetPasswordExpiration = null;
  user.resetPasswordToken = null;
  user.password = await hashStr(data.password);

  await user.save();

  await req.setFlash("success", [
    "Password changed successfully! Sign in to your account.",
  ]);

  res.redirect("/signin");
};
