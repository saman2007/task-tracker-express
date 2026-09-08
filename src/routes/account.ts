import express from "express";
import {
  resendVerificationPostController,
  verifyAccountGetController,
} from "../controllers/account";
import { publicRoute } from "../middlewares/auth";

const accountRouter = express.Router();

accountRouter.get(
  "/account/verify-account",
  publicRoute,
  verifyAccountGetController,
);
accountRouter.post(
  "/account/resend-verification",
  publicRoute,
  resendVerificationPostController,
);

export default accountRouter;
