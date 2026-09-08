import bcrypt from "bcrypt";

import { User } from "../models";
import { Controller } from "../types/types";
import { generateToken, hashStr } from "../utils/utils";
import { sendAccountVerifyLinkEmail } from "../utils/emailSenders";
import { verifyAccountSchema } from "../utils/validations/verifyAccountSchema.shared";

export const verifyAccountGetController: Controller = async (req, res) => {
  const token = req.query.token as string;
  const email = req.query.email as string;

  if (!token && !email) {
    return res.redirect("/404");
  }

  if (!verifyAccountSchema.safeParse({ email }).success) {
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
  const result = verifyAccountSchema.safeParse(req.body);

  if (!result.success) {
    return res.redirect("/404");
  }

  const { email } = result.data;

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
