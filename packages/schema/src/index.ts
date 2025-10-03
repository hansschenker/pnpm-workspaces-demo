import { z } from 'zod';

export const CounterSchema = z.object({
  value: z.number()
});

export type Counter = z.infer<typeof CounterSchema>;
