import fs from "fs";
import path from "path";

import "../utils/env";
import { sequelize } from "../utils/db";
import "../models/task";

const runSeed = async () => {
  try {
    console.log("Reading seed.sql file...");

    const seedFilePath = path.join(__dirname, "..", "data", "seed.sql");
    const sqlScript = fs.readFileSync(seedFilePath, "utf-8");

    console.log("Executing seed query...");

    await sequelize.sync();
    await sequelize.query(sqlScript);

    console.log("Successfully seeded example data into database!");

    process.exit(0);
  } catch (error) {
    console.error("Failed to seed example data:", error);

    process.exit(1);
  }
};

runSeed();
