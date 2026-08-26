import express from "express";

import {
  removeAvatarPostController,
  settingsGetController,
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

export default settingsRouter;
