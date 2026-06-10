import { DurableObject } from 'cloudflare:workers';

import { createApi } from '@netxpert/api';
import type { CounterStore } from '@netxpert/database';
import type { Counter } from '@netxpert/schema';

// SQLite-backed Durable Object holding the counter. Storage survives
// isolate restarts and deploys, unlike the in-memory store on Node.
export class CounterObject extends DurableObject<Env> {
    constructor(ctx: DurableObjectState, env: Env) {
        super(ctx, env);
        ctx.blockConcurrencyWhile(async () => {
            this.ctx.storage.sql.exec(
                'CREATE TABLE IF NOT EXISTS counter (id INTEGER PRIMARY KEY CHECK (id = 1), value INTEGER NOT NULL)'
            );
            this.ctx.storage.sql.exec('INSERT OR IGNORE INTO counter (id, value) VALUES (1, 0)');
        });
    }

    get(): Counter {
        return this.ctx.storage.sql
            .exec<Counter>('SELECT value FROM counter WHERE id = 1')
            .one();
    }

    increment(): Counter {
        return this.add(1);
    }

    decrement(): Counter {
        return this.add(-1);
    }

    reset(): Counter {
        return this.set(0);
    }

    set(value: number): Counter {
        return this.ctx.storage.sql
            .exec<Counter>('UPDATE counter SET value = ? WHERE id = 1 RETURNING value', value)
            .one();
    }

    private add(delta: number): Counter {
        return this.ctx.storage.sql
            .exec<Counter>('UPDATE counter SET value = value + ? WHERE id = 1 RETURNING value', delta)
            .one();
    }
}

// Adapts the Durable Object to the CounterStore port. All requests
// route to one named instance — the counter is a single coordination
// atom, so a single object is correct here, not a bottleneck smell.
function durableObjectStore(namespace: DurableObjectNamespace<CounterObject>): CounterStore {
    const stub = () => namespace.getByName('counter');

    return {
        get: () => stub().get(),
        increment: () => stub().increment(),
        decrement: () => stub().decrement(),
        reset: () => stub().reset(),
        set: (value) => stub().set(value)
    };
}

export default createApi((env) => durableObjectStore((env as Env).COUNTER));
