import { TaskItem } from "./types";

export interface RenderingTaskItem extends TaskItem {
  readonly date: string;
  readonly time: string;
}

export interface TasksStatistic {
  totalTasks: number;
  completedCount: number;
  pendingCount: number;
}
