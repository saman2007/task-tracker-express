import {
  CreationOptional,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Op,
  DataTypes as t,
  Utils,
} from "sequelize";

import { Priority } from "../types/types";
import { sequelize } from "../utils/db";
import { TasksStatistic } from "../types/interfaces";
import { PRIORITY_FILTERS } from "../utils/constants";
import { getFormattedDate, getFormattedTime } from "../utils/utils";
import User from "./user";

export type SequelizeExpression = Utils.Literal | Utils.Fn | Utils.Col;
export type UpdateTaskInput = {
  [K in keyof InferAttributes<Task>]?:
    | InferAttributes<Task>[K]
    | SequelizeExpression;
};

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
  declare userId: ForeignKey<User["id"]>;

  public static async getTasksStatistic(user: User): Promise<TasksStatistic> {
    const totalTasks = await user.countTasks();
    const totalPendingTasks = await user.countTasks({
      where: { isCompleted: 0 },
    });

    return {
      totalTasks,
      pendingCount: totalPendingTasks,
      completedCount: totalTasks - totalPendingTasks,
    };
  }

  public static async getTasks(
    user: User,
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
      tasks = await user.getTasks({
        where: {
          priority: { [Op.eq]: priority },
        },
        order: [["createdAt", "DESC"]],
      });
    } else {
      tasks = await user.getTasks({ order: [["createdAt", "DESC"]] });
    }

    return tasks;
  }

  public static async getNewestTasks(user: User): Promise<Task[]> {
    const newestTasks = await user.getTasks({
      limit: 3,
      order: [["createdAt", "DESC"]],
    });

    return newestTasks;
  }

  public static async toggleTask(id: number, userId: number): Promise<void> {
    await Task.updateTask(
      id,
      {
        isCompleted: sequelize.literal("NOT isCompleted"),
      },
      userId,
    );
  }

  public static async getTask(
    id: number,
    userId: number,
  ): Promise<Task | null> {
    const task = await Task.findOne({ where: { id, userId } });

    return task;
  }

  public static async deleteTask(id: number, userId: number): Promise<void> {
    await Task.destroy({ where: { id, userId } });
  }

  public static async updateTask(
    id: number,
    data: UpdateTaskInput,
    userId: number,
  ): Promise<number> {
    return (await Task.update(data, { where: { id, userId } }))[0];
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
      get(): string | undefined {
        return this.createdAt ? getFormattedDate(this.createdAt) : undefined;
      },
    },
    createdTime: {
      type: t.VIRTUAL,
      get(): string | undefined {
        return this.createdAt ? getFormattedTime(this.createdAt) : undefined;
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
