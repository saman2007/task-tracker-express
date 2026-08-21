import Task from "./task";
import User from "./user";

// Declaring User and Task relations
Task.belongsTo(User, {
  foreignKey: "userId",
});

User.hasMany(Task, {
  foreignKey: {
    name: "userId",
    allowNull: false,
  },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

export { User, Task };
