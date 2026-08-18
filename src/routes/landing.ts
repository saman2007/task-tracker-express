import express from "express";

import { landingGetController } from "../controllers/landing";
import { publicRoute } from "../middlewares/auth";

const landingRouter = express.Router();

landingRouter.get("/", publicRoute, landingGetController);

export default landingRouter;
