import express from "express";

import dotenv from "dotenv";

import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const app = express();

app.use((req, res, next) => {
  res.send("hello");
});

app.listen(process.env.PORT || 3000);
