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
import { hashStr } from "../utils/utils";

export const settingsGetController: Controller = async (req, res) => {
  const [avatarErrors, avatarSuccess, passwordErrors, passwordSuccess] =
    await Promise.all([
      req.getFlash("avatarErrors"),
      req.getFlash("avatarSuccess"),
      req.getFlash("passwordErrors"),
      req.getFlash("passwordSuccess"),
    ]);

  res.render("settings", {
    pageTitle: "Settings",
    currentUser: req.user,
    avatarErrors,
    avatarSuccess,
    passwordErrors,
    passwordSuccess,
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
