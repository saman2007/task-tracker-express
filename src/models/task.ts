import type {
  RenderingTaskItem,
  TaskItem,
  TasksStatistic,
} from "../types/interfaces";
import { Priority } from "../types/types";

import fs from "fs";
import { JSON_TASKS_PATH, PRIORITY_FILTERS } from "../utils/constants";
import { getDateByISOString, getTimeByISOString } from "../utils/utils";

class Task {
  private readonly id: string;
  private title: string;
  private note: string;
  private priority: Priority;
  private isCompleted: boolean;
  private readonly createdAt: string;
  private static tasks: TaskItem[] = [];

  constructor(title: string, note = "", priority: Priority = Priority.MEDIUM) {
    this.id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    this.title = title;
    this.note = note;
    this.priority = priority;
    this.isCompleted = false;
    this.createdAt = new Date().toISOString();
  }

  public getId(): string {
    return this.id;
  }

  public getTitle(): string {
    return this.title;
  }

  public setTitle(title: string): void {
    this.title = title;
  }

  public getNote(): string {
    return this.note;
  }

  public setNote(note: string): void {
    this.note = note;
  }

  public getPriority(): Priority {
    return this.priority;
  }

  public setPriority(priority: Priority): void {
    this.priority = priority;
  }

  public getIsCompleted(): boolean {
    return this.isCompleted;
  }

  public setIsCompleted(isCompleted: boolean): void {
    this.isCompleted = isCompleted;
  }

  public getCreatedAt(): string {
    return this.createdAt;
  }

  public static getTasks(): TaskItem[] {
    return Task.tasks;
  }

  public static initialize(onSuccess: () => void) {
    fs.readFile(JSON_TASKS_PATH, { encoding: "utf-8" }, (err, data) => {
      if (err) {
        if (err.code === "ENOENT") {
          Task.tasks = [];

          fs.writeFile(JSON_TASKS_PATH, "[]", { encoding: "utf-8" }, () => {
            onSuccess();
          });
        } else {
          console.error("SOMETHING WENT WRONG WHILE INITIALIZING THE PROJECT.");
          console.error("ERROR:", err);
          process.exit();
        }
      } else {
        Task.tasks = JSON.parse(data) as TaskItem[];
        onSuccess();
      }
    });
  }

  public static addTask(
    task: Task,
    cb: (err: NodeJS.ErrnoException | null) => void,
  ) {
    const taskObj: TaskItem = {
      id: task.id,
      title: task.title,
      note: task.note,
      priority: task.priority,
      isCompleted: task.isCompleted,
      createdAt: task.createdAt,
    };

    Task.tasks.push(taskObj);

    fs.writeFile(
      JSON_TASKS_PATH,
      JSON.stringify(Task.tasks),
      { encoding: "utf-8" },
      cb,
    );
  }

  /**
   * @param priorityFilter possible values
   * - `0`: for low priority filter
   * - `1`: for medium priority filter
   * - `2`: for high priority filter
   * - `3`: for all priorities
   */
  public static getRenderingTasks(
    priorityFilter?: string | number,
  ): RenderingTaskItem[] {
    const priorityNumber =
      priorityFilter && PRIORITY_FILTERS.includes(priorityFilter.toString())
        ? +priorityFilter
        : 3;

    let tasks = Task.getTasks();

    if (priorityNumber !== 3) {
      tasks = tasks.filter(({ priority }) => priority === priorityNumber);
    }

    const renderingTasks: RenderingTaskItem[] = tasks.map(
      ({ createdAt, ...other }) => ({
        ...other,
        createdAt,
        date: getDateByISOString(createdAt),
        time: getTimeByISOString(createdAt),
      }),
    );

    return renderingTasks;
  }

  public static getTasksStatistic(): TasksStatistic {
    const totalTasks = Task.tasks.length;
    const pendingCount = Task.tasks.reduce(
      (count, { isCompleted }) => (isCompleted ? count : count + 1),
      0,
    );

    return {
      totalTasks,
      pendingCount,
      completedCount: totalTasks - pendingCount,
    };
  }

  public static toggleTask(
    taskId: string,
    cb: (err: NodeJS.ErrnoException | null) => void,
  ): void {
    const task = Task.tasks.find(({ id }) => id === taskId)!;

    task.isCompleted = !task.isCompleted;

    fs.writeFile(
      JSON_TASKS_PATH,
      JSON.stringify(Task.tasks),
      { encoding: "utf-8" },
      cb,
    );
  }
}

export default Task;
