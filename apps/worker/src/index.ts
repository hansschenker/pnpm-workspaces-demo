import { api } from '@netxpert/api';

// Same routes as apps/server, bound to the Workers runtime instead of Node.
// Note: the in-memory counter in @netxpert/database is per-isolate and
// ephemeral on Workers — real state belongs in a Durable Object, KV or D1.
export default api;
