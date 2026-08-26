import express from "express";

import {
  removeAvatarPostController,
  settingsGetController,
  updatePasswordPostController,
  uploadAvatarPostController,
} from "../controllers/settings";
import { privateRoute } from "../middlewares/auth";

const settingsRouter = express.Router();

settingsRouter.get("/settings", privateRoute, settingsGetController);
settingsRouter.post(
  "/settings/avatar",
  privateRoute,
  uploadAvatarPostController,
);
settingsRouter.post("/settings/avatar/delete", removeAvatarPostController);
settingsRouter.post("/settings/password", updatePasswordPostController);

export default settingsRouter;
