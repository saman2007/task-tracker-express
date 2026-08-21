import fs from "fs";
import path from "path";

import "../utils/env";
import { sequelize } from "../utils/db";
import "../models/index";

const runSeed = async () => {
  try {
    console.log("Reading seed.sql file...");

    const seedFilePath = path.join(__dirname, "..", "data", "seed.sql");
    const sqlScript = fs.readFileSync(seedFilePath, "utf-8");

    console.log("Syncing database...");

    await sequelize.sync({ force: true });

    console.log("Executing seed query...");

    const statements = sqlScript
      .split(";")
      .map((statement) => statement.trim())
      .filter((statement) => statement.length > 0);

    for (const statement of statements) {
      await sequelize.query(statement);
    }

    console.log("Successfully seeded example data into database!");

    process.exit(0);
  } catch (error) {
    console.error("Failed to seed example data:", error);

    process.exit(1);
  }
};

runSeed();
