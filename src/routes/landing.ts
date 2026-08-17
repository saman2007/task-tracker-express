import express from "express";

import { landingGetController } from "../controllers/landing";

const landingRouter = express.Router();

landingRouter.get("/", landingGetController);

export default landingRouter;
