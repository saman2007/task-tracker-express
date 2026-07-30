import express from "express";
import dotenv from "dotenv";

import path from "path";

import dashboardRouter from "./routes/dashboard";
import notFoundRouter from "./routes/notFound";
import addTaskRouter from "./routes/addTask";
import Task from "./models/task";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.use(dashboardRouter);
app.use(addTaskRouter);
app.use(notFoundRouter);
app.use((_, res) => {
  res.redirect("/404");
});

console.log("Initializing...");

Task.initialize(() => {
  const port = process.env.PORT || 3000;

  console.log("Done!");

  app.listen(port);

  console.log("listening to port", port);
});
