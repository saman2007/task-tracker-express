import { Priority } from "./types";

export interface TaskItem {
  readonly id: string;
  title: string;
  note: string;
  priority: Priority;
  isCompleted: boolean;
  readonly createdAt: string;
}

export interface RenderingTaskItem {
  readonly id: string;
  title: string;
  note: string;
  priority: Priority;
  isCompleted: boolean;
  readonly createdAt: string;
  readonly date: string;
  readonly time: string;
}

export interface TasksStatistic {
  totalTasks: number;
  completedCount: number;
  pendingCount: number;
}
