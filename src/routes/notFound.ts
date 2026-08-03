import express from "express";

import {
  notFoundCatchAllController,
  notFoundGetController,
} from "../controllers/notFound";

const notFoundRouter = express.Router();

notFoundRouter.get("/404", notFoundGetController);
notFoundRouter.use(notFoundCatchAllController);

export default notFoundRouter;
