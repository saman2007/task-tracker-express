import path from "path";
import crypto from "crypto";
import fs from "fs/promises";

import multer from "multer";
import * as z from "zod";
import bcrypt from "bcrypt";

import { Controller } from "../types/types";
import {
  updatePasswordSchema,
  UpdatePasswordSchemaData,
} from "../utils/validations/updatePasswordSchema.shared";
import { generateToken, hashStr } from "../utils/utils";
import {
  updateProfileSchema,
  UpdateProfileSchemaData,
} from "../utils/validations/updateProfileSchema.shared";
import { User } from "../models";
import { sendChangeEmailLink } from "../utils/emailSenders";

export const settingsGetController: Controller = async (req, res) => {
  const [
    avatarErrors,
    avatarSuccess,
    passwordErrors,
    passwordSuccess,
    profileErrors,
    profileSuccess,
  ] = await Promise.all([
    req.getFlash("avatarErrors"),
    req.getFlash("avatarSuccess"),
    req.getFlash("passwordErrors"),
    req.getFlash("passwordSuccess"),
    req.getFlash("profileErrors"),
    req.getFlash("profileSuccess"),
  ]);

  res.render("settings", {
    pageTitle: "Settings",
    currentUser: req.user,
    avatarErrors,
    avatarSuccess,
    passwordErrors,
    passwordSuccess,
    profileErrors,
    profileSuccess,
  });
};

const diskStorage = multer.diskStorage({
  destination: path.join(process.cwd(), "src", "public", "uploads", "avatars"),
  filename: (_, file, cb) => {
    crypto.randomBytes(16, function (err, raw) {
      if (err) return cb(err, "");

      const formatMap: Record<string, string> = {
        "image/png": "png",
        "image/jpg": "jpg",
        "image/jpeg": "jpeg",
      };

      if (!formatMap[file.mimetype])
        return cb(new Error("Invalid file extensions"), "");

      cb(null, `avatar-${raw.toString("hex")}.${formatMap[file.mimetype]}`);
    });
  },
});

const uploadAvatar = multer({
  limits: {
    /* 5 Megabytes */
    fileSize: 5 * 1_000_000,
    /* Only one file is needed */
    files: 1,
    /* No text fields are needed */
    fields: 0,
  },
  storage: diskStorage,
}).single("avatar");

export const uploadAvatarPostController: Controller = (req, res, next) => {
  uploadAvatar(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError) {
        await req.setFlash("avatarErrors", [err.message]);

        return res.redirect("/settings");
      } else if (err) {
        return next(err);
      }

      if (req.user?.profileUrl) {
        try {
          const filePath = path.join(
            process.cwd(),
            "src",
            "public",
            req.user.profileUrl,
          );

          fs.access(filePath).then(() => fs.unlink(filePath));
        } catch (error) {}
      }

      req.user!.profileUrl = "/uploads/avatars/" + req.file!.filename;

      await req.user!.save();

      await req.setFlash("avatarSuccess", ["Avatar uploaded successfully."]);

      res.redirect("/settings");
    } catch (error) {
      next(error);
    }
  });
};

export const removeAvatarPostController: Controller = async (req, res) => {
  if (req.user?.profileUrl) {
    try {
      const filePath = path.join(
        process.cwd(),
        "src",
        "public",
        req.user.profileUrl,
      );

      fs.access(filePath).then(() => fs.unlink(filePath));
    } catch (error) {}
  }

  req.user!.profileUrl = null;

  await req.user!.save();

  await req.setFlash("avatarSuccess", ["Avatar removed successfully."]);

  res.redirect("/settings");
};

export const updatePasswordPostController: Controller = async (
  req,
  res,
  next,
) => {
  let data: UpdatePasswordSchemaData;

  try {
    data = await updatePasswordSchema.parseAsync(req.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      await req.setFlash(
        "passwordErrors",
        error.issues.map(({ message }) => message),
      );

      return res.redirect(`/settings`);
    } else {
      return next(error);
    }
  }

  const isMatch = await bcrypt.compare(
    data.currentPassword,
    req.user!.password,
  );

  if (!isMatch) {
    console.log("test?!");
    await req.setFlash("passwordErrors", [
      "Your entered current password is incorrect.",
    ]);

    return res.redirect("/settings");
  }

  req.user!.password = await hashStr(data.password);

  await req.user!.save();

  await req.setFlash("passwordSuccess", [
    "Your password updated successfully.",
  ]);

  return res.redirect("/settings");
};

export const updateProfilePostController: Controller = async (
  req,
  res,
  next,
) => {
  let data: UpdateProfileSchemaData;
  const errors: string[] = [];
  const success: string[] = [];

  try {
    data = await updateProfileSchema.parseAsync(req.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      await req.setFlash(
        "profileErrors",
        error.issues.map(({ message }) => message),
      );

      return res.redirect(`/settings`);
    } else {
      return next(error);
    }
  }

  if (req.user!.email !== data.email) {
    const emailUsed = !!(await User.findOne({
      where: { email: data.email },
      attributes: ["id"],
    }));

    if (!emailUsed) {
      const token = await generateToken(32);

      req.user!.newEmail = data.email;
      req.user!.emailActionToken = await hashStr(token);
      req.user!.emailActionExp = new Date(Date.now() + 1000 * 60 * 60);

      sendChangeEmailLink(data.email, {
        token,
        fullname: req.user!.fullname,
        email: req.user!.email,
      });

      success.push(
        "We've sent a confirmation link to your new email. Please click the link to complete your email update. Note that when opening the link, you must be logged in to this account.",
      );
    } else {
      errors.push(
        "This email is already in use. Please choose a different one.",
      );
    }
  }

  if (req.user!.fullname !== data.fullname) {
    req.user!.fullname = data.fullname;

    success.push("Updated profile successfully.");
  }

  if (req.user!.changed()) {
    await req.user!.save();
  }

  await Promise.all([
    req.setFlash("profileErrors", errors),
    req.setFlash("profileSuccess", success),
  ]);

  return res.redirect("/settings");
};
