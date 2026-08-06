import { NextFunction, Request, Response } from "express";
import { InferAttributes } from "sequelize";
import Task from "../models/task";

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

export type TaskItem = Omit<InferAttributes<Task>, "updatedAt">;

export type CreateTaskInput = Omit<
  TaskItem,
  "id" | "createdAt" | "isCompleted"
>;

export type FSCallback = (err: NodeJS.ErrnoException | null) => void;
