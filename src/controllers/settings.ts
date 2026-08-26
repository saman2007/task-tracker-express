import path from "path";
import crypto from "crypto";
import fs from "fs/promises";

import multer from "multer";

import { Controller } from "../types/types";

export const settingsGetController: Controller = async (req, res) => {
  const [avatarErrors, avatarSuccess] = await Promise.all([
    req.getFlash("avatarErrors"),
    req.getFlash("avatarSuccess"),
  ]);

  res.render("settings", {
    pageTitle: "Settings",
    currentUser: req.user,
    avatarErrors,
    avatarSuccess,
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
