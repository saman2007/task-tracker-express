import express from "express";
import dotenv from "dotenv";

import path from "path";

import dashboardRouter from "./routes/dashboard";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.use(dashboardRouter);

app.listen(process.env.PORT || 3000);
