import { CreateTaskSchema, type Task, CreateTask } from '@jilles/schema';

const tasks: Record<string, Task> = {};

export function create(task: CreateTask): Task {
  const data = CreateTaskSchema.safeParse(task);

  if (!data.success) {
    throw new Error('Invalid task data');
  }

  const id = crypto.randomUUID();
  tasks[id] = {
    ...task,
    id,
    createdAt: new Date().toISOString()
  };
  return tasks[id];
}

export function getAll(): Task[] {
  return Object.values(tasks);
}
