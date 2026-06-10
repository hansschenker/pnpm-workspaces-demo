import { Hono } from 'hono';

import { CounterSchema } from '@netxpert/schema';
import type { CounterStore } from '@netxpert/database';

type ApiEnv = { Variables: { store: CounterStore } };

// The store is resolved per request from the runtime's env, so each
// deployable injects its own storage (in-memory on Node, a Durable
// Object on Workers) without this package knowing about runtimes.
// Routes are chained so the full route tree is captured in AppType,
// which the client uses for the end-to-end typed RPC client (hc).
export function createApi(resolveStore: (env: unknown) => CounterStore) {
    return new Hono<ApiEnv>()
        .use(async (c, next) => {
            c.set('store', resolveStore(c.env));
            await next();
        })
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
        .get('/counter', async (c) => c.json(await c.var.store.get()))
        .post('/counter/increment', async (c) => c.json(await c.var.store.increment()))
        .post('/counter/decrement', async (c) => c.json(await c.var.store.decrement()))
        .post('/counter/reset', async (c) => c.json(await c.var.store.reset()))
        .post('/counter/set', async (c) => {
            const body = await c.req.json();
            const result = CounterSchema.safeParse(body);

            if (!result.success) {
                return c.json({ error: 'Invalid counter value', issues: result.error.issues }, 400);
            }

            return c.json(await c.var.store.set(result.data.value));
        });
}

export type AppType = ReturnType<typeof createApi>;
