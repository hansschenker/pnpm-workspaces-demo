import { z } from 'zod';

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  completed: z.boolean(),
  createdAt: z.string().datetime()
});

export const CreateTaskSchema = TaskSchema.omit({ id: true, createdAt: true });

export type Task = z.infer<typeof TaskSchema>;
export type CreateTask = z.infer<typeof CreateTaskSchema>;
