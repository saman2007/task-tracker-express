import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
  DataTypes as t,
} from "sequelize";
import { sequelize } from "../utils/db";

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare fullname: string;
  declare email: string;
  declare password: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

User.init(
  {
    id: { autoIncrement: true, primaryKey: true, type: t.INTEGER },
    fullname: { type: t.STRING(255, false), allowNull: false },
    email: { type: t.STRING(255, false), unique: true, allowNull: false },
    password: { type: t.TEXT, allowNull: false },
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
