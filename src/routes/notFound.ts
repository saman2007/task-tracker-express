import express from "express";
import { getNotFoundPage } from "../controllers/notFound";

const notFoundRouter = express.Router();

notFoundRouter.get("/404", getNotFoundPage);

export default notFoundRouter;
