import { serve } from '@hono/node-server';

import { api } from '@netxpert/api';

// The api package is runtime-agnostic; this app binds it to Node.
// apps/worker binds the same routes to Cloudflare Workers.
serve(
    {
        fetch: api.fetch,
        port: 3000
    },
    (info) => {
        console.log(`API server running on http://localhost:${info.port}`);
    }
);
