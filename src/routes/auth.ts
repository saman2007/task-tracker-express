import express from "express";
import {
  signInGetController,
  signUpGetController,
  signUpPostController,
} from "../controllers/auth";

const authRouter = express.Router();

authRouter.get("/signin", signInGetController);
authRouter.get("/signup", signUpGetController);
authRouter.post("/signup", signUpPostController);

export default authRouter;
