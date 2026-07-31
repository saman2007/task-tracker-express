import { NextFunction, Request, Response } from "express";
import { TaskItem } from "./interfaces";

export type Controller = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void;

export enum Priority {
  LOW,
  MEDIUM,
  HIGH,
}

export type CreateTaskInput = Omit<
  TaskItem,
  "id" | "createdAt" | "isCompleted"
>;

export type FSCallback = (err: NodeJS.ErrnoException | null) => void;
