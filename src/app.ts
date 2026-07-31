import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";

import path from "path";

import dashboardRouter from "./routes/dashboard";
import notFoundRouter from "./routes/notFound";
import Task from "./models/task";
import tasksRouter from "./routes/tasks";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(dashboardRouter);
app.use(tasksRouter);
app.use(notFoundRouter);

console.log("initializing...");

Task.initialize(() => {
  const port = process.env.PORT || 3000;

  console.log("done!");

  app.listen(port);

  console.log("listening to port", port);
});
