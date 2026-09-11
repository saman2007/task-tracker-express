import {
  CreationOptional,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  DataTypes as t,
} from "sequelize";
import { sequelize } from "../utils/db";
import { getFormattedDate, getFormattedTime } from "../utils/utils";
import User from "./user";

class FocusSession extends Model<
  InferAttributes<FocusSession>,
  InferCreationAttributes<FocusSession>
> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User["id"]>;
  declare taskId: CreationOptional<number | null>;
  declare taskTitle: CreationOptional<string | null>;
  declare durationMinutes: number;
  declare mode: "focus" | "shortBreak" | "longBreak";
  declare completedAt: CreationOptional<Date>;
  declare notes: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare createdDate: CreationOptional<string>;
  declare createdTime: CreationOptional<string>;
}

FocusSession.init(
  {
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: t.INTEGER,
    },
    userId: {
      allowNull: false,
      type: t.INTEGER,
    },
    taskId: {
      allowNull: true,
      type: t.INTEGER,
    },
    taskTitle: {
      allowNull: true,
      type: t.STRING(255),
    },
    durationMinutes: {
      allowNull: false,
      type: t.INTEGER,
      defaultValue: 25,
    },
    mode: {
      allowNull: false,
      type: t.ENUM("focus", "shortBreak", "longBreak"),
      defaultValue: "focus",
    },
    completedAt: {
      allowNull: false,
      type: t.DATE,
      defaultValue: t.NOW,
    },
    notes: {
      allowNull: true,
      type: t.TEXT,
    },
    createdDate: {
      type: t.VIRTUAL,
      get(): string | undefined {
        return this.completedAt ? getFormattedDate(this.completedAt) : undefined;
      },
    },
    createdTime: {
      type: t.VIRTUAL,
      get(): string | undefined {
        return this.completedAt ? getFormattedTime(this.completedAt) : undefined;
      },
    },
    createdAt: t.DATE,
    updatedAt: t.DATE,
  },
  {
    tableName: "focus_sessions",
    sequelize,
    defaultScope: { attributes: { exclude: ["updatedAt"] } },
  },
);

export default FocusSession;
