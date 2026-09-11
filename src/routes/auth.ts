import express from "express";
import {
  logoutPostController,
  resetPasswordGetController,
  resetPasswordPostController,
  resetPasswordRequestGetController,
  resetPasswordRequestPostController,
  signInGetController,
  signInPostController,
  signUpGetController,
  signUpPostController,
} from "../controllers/auth";
import { privateRoute, publicRoute } from "../middlewares/auth";

const authRouter = express.Router();

authRouter.get("/signin", publicRoute, signInGetController);
authRouter.post("/signin", publicRoute, signInPostController);
authRouter.get("/signup", publicRoute, signUpGetController);
authRouter.post("/signup", publicRoute, signUpPostController);
authRouter.post("/logout", privateRoute, logoutPostController);
authRouter.get(
  "/reset-password",
  publicRoute,
  resetPasswordRequestGetController,
);
authRouter.post(
  "/reset-password",
  publicRoute,
  resetPasswordRequestPostController,
);
authRouter.get(
  "/reset-password/:token",
  publicRoute,
  resetPasswordGetController,
);
authRouter.post(
  "/reset-password/:token",
  publicRoute,
  resetPasswordPostController,
);

export default authRouter;
