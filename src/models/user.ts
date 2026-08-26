import {
  CreationOptional,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManySetAssociationsMixin,
  InferAttributes,
  InferCreationAttributes,
  Model,
  DataTypes as t,
} from "sequelize";
import { sequelize } from "../utils/db";
import Task from "./task";

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare fullname: string;
  declare profileUrl: CreationOptional<string | null>;
  declare email: string;
  declare password: string;
  declare resetPasswordToken: CreationOptional<string | null>;
  declare resetPasswordExpiration: CreationOptional<Date | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare getTasks: HasManyGetAssociationsMixin<Task>;
  declare addTask: HasManyAddAssociationMixin<Task, number>;
  declare addTasks: HasManyAddAssociationsMixin<Task, number>;
  declare setTasks: HasManySetAssociationsMixin<Task, number>;
  declare removeTask: HasManyRemoveAssociationMixin<Task, number>;
  declare removeTasks: HasManyRemoveAssociationsMixin<Task, number>;
  declare hasTask: HasManyHasAssociationMixin<Task, number>;
  declare hasTasks: HasManyHasAssociationsMixin<Task, number>;
  declare countTasks: HasManyCountAssociationsMixin;
  declare createTask: HasManyCreateAssociationMixin<Task, "userId">;
}

User.init(
  {
    id: { autoIncrement: true, primaryKey: true, type: t.INTEGER },
    fullname: { type: t.STRING(255, false), allowNull: false },
    email: { type: t.STRING(255, false), unique: true, allowNull: false },
    profileUrl: { type: t.STRING(255, false), allowNull: true },
    password: { type: t.TEXT, allowNull: false },
    resetPasswordToken: { type: t.TEXT, allowNull: true },
    resetPasswordExpiration: { type: t.DATE, allowNull: true },
    createdAt: t.DATE,
    updatedAt: t.DATE,
  },
  {
    sequelize: sequelize,
    tableName: "users",
    defaultScope: { attributes: { exclude: ["updatedAt"] } },
  },
);

export default User;
