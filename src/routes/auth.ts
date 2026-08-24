import express from "express";
import {
  logoutPostController,
  resetPasswordGetController,
  resetPasswordRequestGetController,
  signInGetController,
  signInPostController,
  signUpGetController,
  signUpPostController,
} from "../controllers/auth";
import { publicRoute } from "../middlewares/auth";

const authRouter = express.Router();

authRouter.get("/signin", publicRoute, signInGetController);
authRouter.post("/signin", publicRoute, signInPostController);
authRouter.get("/signup", publicRoute, signUpGetController);
authRouter.post("/signup", publicRoute, signUpPostController);
authRouter.post("/logout", logoutPostController);
authRouter.get("/reset-password", resetPasswordRequestGetController);
authRouter.get("/reset-password/:token", resetPasswordGetController);

export default authRouter;
