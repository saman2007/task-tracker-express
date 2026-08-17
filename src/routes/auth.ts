import express from "express";
import { signInGetController, signUpGetController } from "../controllers/auth";

const authRouter = express.Router();

authRouter.get("/signin", signInGetController);
authRouter.get("/signup", signUpGetController);

export default authRouter;
