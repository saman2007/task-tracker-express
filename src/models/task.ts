import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
  Op,
  DataTypes as t,
  Utils,
} from "sequelize";

export type SequelizeExpression = Utils.Literal | Utils.Fn | Utils.Col;
export type UpdateTaskInput = {
  [K in keyof InferAttributes<Task>]?:
    | InferAttributes<Task>[K]
    | SequelizeExpression;
};

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
  declare createdDate: string;
  declare createdTime: string;

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
  ): Promise<Task[]> {
    const priorityNumber =
      priorityFilter && PRIORITY_FILTERS.includes(priorityFilter.toString())
        ? +priorityFilter
        : 3;

    const priority =
      priorityNumber === 3
        ? null
        : (Priority[priorityNumber] as keyof typeof Priority);

    let tasks: Task[];

    if (priority) {
      tasks = await Task.findAll({
        where: {
          priority: { [Op.eq]: priority },
        },
      });
    } else {
      tasks = await Task.findAll();
    }

    return tasks;
  }

  public static async getNewestTasks(): Promise<Task[]> {
    const newestTasks = await Task.findAll({
      limit: 3,
      order: [["createdAt", "DESC"]],
    });

    return newestTasks;
  }

  public static async toggleTask(id: number): Promise<void> {
    await Task.updateTask(id, {
      isCompleted: sequelize.literal('NOT "isCompleted"'),
    });
  }

  public static async getTask(id: number): Promise<Task | null> {
    const task = await Task.findOne({ where: { id } });

    return task;
  }

  public static async deleteTask(id: number): Promise<void> {
    await Task.destroy({ where: { id: +id } });
  }

  public static async updateTask(
    id: number,
    data: UpdateTaskInput,
  ): Promise<void> {
    await Task.update(data, { where: { id } });
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
    createdDate: {
      type: t.VIRTUAL,
      get(): string {
        return getFormattedDate(this.createdAt);
      },
    },
    createdTime: {
      type: t.VIRTUAL,
      get(): string {
        return getFormattedTime(this.createdAt);
      },
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
