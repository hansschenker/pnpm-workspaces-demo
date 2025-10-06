import { z } from 'zod';

export const CounterSchema = z.object({
    value: z.number()
});

// This is a counter
export type Counter = z.infer<typeof CounterSchema>;
