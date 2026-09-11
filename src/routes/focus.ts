import express from "express";
import {
  focusGetController,
  focusSessionCreatePostController,
  focusSessionDeletePostController,
  focusStatsGetController,
} from "../controllers/focus";
import { privateRoute } from "../middlewares/auth";

const focusRouter = express.Router();

focusRouter.get("/focus", privateRoute, focusGetController);
focusRouter.post(
  "/api/focus/sessions",
  privateRoute,
  express.json(),
  focusSessionCreatePostController,
);
focusRouter.post(
  "/focus/sessions/:id/delete",
  privateRoute,
  focusSessionDeletePostController,
);
focusRouter.delete(
  "/api/focus/sessions/:id",
  privateRoute,
  focusSessionDeletePostController,
);
focusRouter.get("/api/focus/stats", privateRoute, focusStatsGetController);

export default focusRouter;
