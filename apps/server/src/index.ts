import { serve } from '@hono/node-server';

import { api } from '@netxpert/api';

// The api package is runtime-agnostic; this app binds it to Node.
// A Cloudflare Workers deployment would instead be:
//   export default { fetch: api.fetch }
serve(
    {
        fetch: api.fetch,
        port: 3000
    },
    (info) => {
        console.log(`API server running on http://localhost:${info.port}`);
    }
);
