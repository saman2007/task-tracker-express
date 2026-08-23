import * as z from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "You must enter a title for your task."),
  priority: z.enum(
    ["LOW", "MEDIUM", "HIGH"],
    "You must select one of Low or Medium or High options.",
  ),
  note: z.string().min(1, "You must enter a note for your task."),
});
