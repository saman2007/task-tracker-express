import express from "express";

import {
  removeAvatarPostController,
  settingsGetController,
  updatePasswordPostController,
  updateProfilePostController,
  uploadAvatarPostController,
} from "../controllers/settings";
import { privateRoute } from "../middlewares/auth";

const settingsRouter = express.Router();

settingsRouter.get("/settings", privateRoute, settingsGetController);
settingsRouter.post(
  "/settings/update-avatar",
  privateRoute,
  uploadAvatarPostController,
);
settingsRouter.post(
  "/settings/delete-avatar",
  privateRoute,
  removeAvatarPostController,
);
settingsRouter.post(
  "/settings/update-password",
  privateRoute,
  updatePasswordPostController,
);
settingsRouter.post(
  "/settings/update-profile",
  privateRoute,
  updateProfilePostController,
);

export default settingsRouter;
