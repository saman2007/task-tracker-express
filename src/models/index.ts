import Task from "./task";
import User from "./user";
import FocusSession from "./focusSession";

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

FocusSession.belongsTo(User, {
  foreignKey: {
    name: "userId",
    allowNull: false,
  },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

User.hasMany(FocusSession, {
  foreignKey: "userId",
});

FocusSession.belongsTo(Task, {
  foreignKey: {
    name: "taskId",
    allowNull: true,
  },
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

Task.hasMany(FocusSession, {
  foreignKey: "taskId",
});

export { User, Task, FocusSession };
