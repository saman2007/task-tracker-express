import path from "path";

import bodyParser from "body-parser";
import express from "express";
import session from "express-session";
import ConnectSessionSequelize from "connect-session-sequelize";

import "./utils/env";
import dashboardRouter from "./routes/dashboard";
import notFoundRouter from "./routes/notFound";
import tasksRouter from "./routes/tasks";
import { sequelize } from "./utils/db";
import authRouter from "./routes/auth";
import landingRouter from "./routes/landing";

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    // 30 days
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 },
    resave: false,
    saveUninitialized: false,
    store: new (ConnectSessionSequelize(session.Store))({
      db: sequelize,
    }),
    rolling: false,
  }),
);

app.use(landingRouter);
app.use(authRouter);
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
