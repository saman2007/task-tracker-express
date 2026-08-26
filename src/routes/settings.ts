import express from "express";

import { settingsGetController } from "../controllers/settings";
import { privateRoute } from "../middlewares/auth";

const settingsRouter = express.Router();

settingsRouter.get("/settings", privateRoute, settingsGetController);

export default settingsRouter;

