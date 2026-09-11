import bcrypt from "bcrypt";
import * as z from "zod";

import { User } from "../models";
import { Controller } from "../types/types";
import { generateToken, hashStr } from "../utils/utils";
import { sendAccountVerifyLinkEmail } from "../utils/emailSenders";

export const verifyAccountGetController: Controller = async (req, res) => {
  const token = req.query.token as string;
  const email = req.query.email as string;

  if (!token && !email) {
    return res.redirect("/404");
  }

  if (!z.email().safeParse(email).success) {
    return res.redirect("/404");
  }

  if (token) {
    const user = await User.findOne({
      where: {
        email,
        isAccountVerified: false,
      },
      attributes: ["id", "emailActionExp", "emailActionToken"],
    });

    if (!user || !(await bcrypt.compare(token, user.emailActionToken || ""))) {
      return res.render("verify-account", {
        pageTitle: "Verify Your Account",
        email,
        errors: ["Invalid token. Request a new verification link."],
        sentSuccess: req.query.success === "true",
      });
    }

    if (user.emailActionExp! < new Date()) {
      return res.render("verify-account", {
        pageTitle: "Verify Your Account",
        email,
        errors: ["The token is expired. Request a new verification link."],
        sentSuccess: req.query.success === "true",
      });
    }

    user.isAccountVerified = true;
    user.emailActionToken = null;
    user.emailActionExp = null;

    await user.save();

    await req.setFlash("success", [
      "Your account is now verified. You can sign in to your account.",
    ]);

    return res.redirect("/signin");
  }

  const [errors, success] = await Promise.all([
    req.getFlash("errors"),
    req.getFlash("success"),
  ]);

  res.render("verify-account", {
    pageTitle: "Verify Your Account",
    email,
    errors,
    success,
    sentSuccess: req.query.success === "true",
  });
};

export const resendVerificationPostController: Controller = async (
  req,
  res,
) => {
  const result = z.email().safeParse(req.body.email as string);

  if (!result.success) {
    return res.redirect("/404");
  }

  const email = result.data;

  const token = await generateToken(32);

  const user = await User.findOne({
    where: { email },
    attributes: ["isAccountVerified"],
  });

  if (!user) {
    return res.redirect("/404");
  }

  if (user.isAccountVerified) {
    return res.redirect("/signin");
  }

  const [affectedCount] = await User.update(
    {
      emailActionToken: await hashStr(token),
      emailActionExp: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
    { where: { email } },
  );

  if (affectedCount === 0) {
    return res.redirect("/404");
  }

  sendAccountVerifyLinkEmail(email, { token });

  res.redirect(`/account/verify-account?success=true&email=${email}`);
};

export const changeEmailPostController: Controller = async (req, res) => {
  const result = z.email().safeParse(req.query.email);

  if (!result.success) {
    await req.setFlash(
      "profileErrors",
      result.error.issues.map(({ message }) => message),
    );

    return res.redirect("/settings");
  }

  const email = req.query.email as string;
  const token = req.query.token as string;

  if (email !== req.user!.email) {
    await req.setFlash("profileErrors", [
      "You must log in to the account that you want to change its email and then open change email verification link.",
    ]);

    return res.redirect("/settings");
  }

  const hashedToken = req.user!.emailActionToken;

  if (!hashedToken || !token || !(await bcrypt.compare(token, hashedToken))) {
    await req.setFlash("profileErrors", ["Invalid token passed."]);

    return res.redirect("/settings");
  }

  if (req.user!.emailActionExp! < new Date()) {
    await req.setFlash("profileErrors", [
      "Token is expired. Change your email again and then update your profile to get a new verify email.",
    ]);

    req.user!.newEmail = null;
    req.user!.emailActionToken = null;
    req.user!.emailActionExp = null;

    await req.user!.save();

    return res.redirect("/settings");
  }

  req.user!.email = req.user!.newEmail!;
  req.user!.emailActionToken = null;
  req.user!.emailActionExp = null;
  req.user!.newEmail = null;

  await req.user!.save();

  await req.setFlash("profileSuccess", [
    "Your account's email changed successfully!",
  ]);

  return res.redirect("/settings");
};
