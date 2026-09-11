import express from "express";

import {
  changeEmailPostController,
  resendVerificationPostController,
  verifyAccountGetController,
} from "../controllers/account";
import { privateRoute, publicRoute } from "../middlewares/auth";

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
accountRouter.get(
  "/account/change-email",
  privateRoute,
  changeEmailPostController,
);

export default accountRouter;
