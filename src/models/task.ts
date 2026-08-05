import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
  Op,
  DataTypes as t,
} from "sequelize";

import { Priority } from "../types/types";
import { sequelize } from "../utils/db";
import { TasksStatistic } from "../types/interfaces";

class Task extends Model<InferAttributes<Task>, InferCreationAttributes<Task>> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare note: string;
  declare priority: keyof typeof Priority;
  declare isCompleted: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  public static async getTasksStatistic(): Promise<
    NonAttribute<TasksStatistic>
  > {
    const totalTasks = await Task.count();
    const totalPendingTasks = await Task.count({
      where: { isCompleted: { [Op.eq]: true } },
    });

    return {
      totalTasks,
      pendingCount: totalPendingTasks,
      completedCount: totalTasks - totalPendingTasks,
    };
  }
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
