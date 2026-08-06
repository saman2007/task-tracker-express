import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
  Op,
  DataTypes as t,
} from "sequelize";

import { Priority, TaskItem } from "../types/types";
import { sequelize } from "../utils/db";
import { RenderingTaskItem, TasksStatistic } from "../types/interfaces";
import { PRIORITY_FILTERS } from "../utils/constants";
import { getFormattedDate, getFormattedTime } from "../utils/utils";

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

  public static async getTasks(
    priorityFilter?: string | number,
  ): Promise<RenderingTaskItem[]> {
    const priorityNumber =
      priorityFilter && PRIORITY_FILTERS.includes(priorityFilter.toString())
        ? +priorityFilter
        : 3;

    const priority =
      priorityNumber === 3
        ? null
        : (Priority[priorityNumber] as keyof typeof Priority);

    let tasks: TaskItem[];

    if (priority) {
      tasks = await Task.findAll({
        where: {
          priority: { [Op.eq]: priority },
        },
      });
    } else {
      tasks = await Task.findAll();
    }

    return tasks.map((task) => Task.toRenderingTask(task));
  }

  public static toRenderingTask(task: TaskItem): RenderingTaskItem {
    return {
      ...task,
      date: getFormattedDate(task.createdAt),
      time: getFormattedTime(task.createdAt),
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
  {
    tableName: "tasks",
    sequelize,
    defaultScope: { attributes: { exclude: ["updatedAt"] } },
  },
);

export default Task;
