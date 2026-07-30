import { Priority } from "./types";

export interface TaskItem {
  readonly id: string;
  title: string;
  note: string;
  priority: Priority;
  isCompleted: boolean;
  readonly createdAt: string;
}
