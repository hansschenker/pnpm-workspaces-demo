import { Hono } from 'hono';

import { CounterSchema } from '@netxpert/schema';
import * as db from '@netxpert/database';

// Routes are chained so the full route tree is captured in AppType,
// which the client uses for the end-to-end typed RPC client (hc).
export const api = new Hono()
    .get('/', (c) =>
        c.json({
            name: 'Counter API',
            endpoints: [
                'GET  /counter',
                'POST /counter/increment',
                'POST /counter/decrement',
                'POST /counter/reset',
                'POST /counter/set { "value": number }'
            ]
        })
    )
    .get('/counter', (c) => c.json(db.get()))
    .post('/counter/increment', (c) => c.json(db.increment()))
    .post('/counter/decrement', (c) => c.json(db.decrement()))
    .post('/counter/reset', (c) => c.json(db.reset()))
    .post('/counter/set', async (c) => {
        const body = await c.req.json();
        const result = CounterSchema.safeParse(body);

        if (!result.success) {
            return c.json({ error: 'Invalid counter value', issues: result.error.issues }, 400);
        }

        return c.json(db.set(result.data.value));
    });

export type AppType = typeof api;
