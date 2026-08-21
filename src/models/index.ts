import Task from "./task";
import User from "./user";

// Declaring User and Task relations
Task.belongsTo(User, {
  foreignKey: {
    name: "userId",
    allowNull: false,
  },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

User.hasMany(Task, {
  foreignKey: "userId",
});

export { User, Task };
