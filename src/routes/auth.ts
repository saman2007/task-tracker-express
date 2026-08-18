import express from "express";
import {
  logoutController,
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
authRouter.post("/logout", logoutController);
authRouter.get("/logout", logoutController);

export default authRouter;
