import express from "express";
import bodyParser from "body-parser";
import path from "path";

import "./utils/env";
import dashboardRouter from "./routes/dashboard";
import notFoundRouter from "./routes/notFound";
import tasksRouter from "./routes/tasks";
import { sequelize } from "./utils/db";

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(dashboardRouter);
app.use(tasksRouter);
app.use(notFoundRouter);

console.log("Syncing DB...");

sequelize
  .sync()
  .then(() => {
    console.log("Done!");

    const port = process.env.PORT || 3000;

    console.log("Initializing server...");

    app.listen(port);

    console.log("Done, listening on port:", port);
  })
  .catch((err) => {
    console.log("Failed to sync DB. Error:", err);
  });
