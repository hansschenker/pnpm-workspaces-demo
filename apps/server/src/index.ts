import { serve } from '@hono/node-server';

import { createApi } from '@netxpert/api';
import { createMemoryStore } from '@netxpert/database';

// The api package is runtime-agnostic; this app binds it to Node
// with a process-lifetime in-memory store.
// apps/worker binds the same routes to Cloudflare Workers, backed
// by a Durable Object.
const store = createMemoryStore();
const api = createApi(() => store);

serve(
    {
        fetch: api.fetch,
        port: 3000
    },
    (info) => {
        console.log(`API server running on http://localhost:${info.port}`);
    }
);
