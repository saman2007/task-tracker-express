import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
  DataTypes as t,
} from "sequelize";

import { Priority } from "../types/types";
import { sequelize } from "../utils/db";

class Task extends Model<InferAttributes<Task>, InferCreationAttributes<Task>> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare note: string;
  declare priority: keyof typeof Priority;
  declare isCompleted: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Task.init(
  {
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: t.INTEGER,
    },
    title: {
      allowNull: false,
      type: t.STRING(255, false),
    },
    note: {
      allowNull: true,
      type: t.TEXT,
    },
    priority: {
      allowNull: false,
      type: t.ENUM("LOW", "MEDIUM", "HIGH"),
    },
    isCompleted: {
      allowNull: false,
      type: t.BOOLEAN,
      defaultValue: false,
    },
    createdAt: t.DATE,
    updatedAt: t.DATE,
  },
  { tableName: "tasks", sequelize },
);

export default Task;
