import type { Counter } from '@netxpert/schema';

// Storage port for the counter. Implementations may be sync (in-memory)
// or async (Durable Object RPC) — consumers must await the results.
export interface CounterStore {
    get(): Counter | Promise<Counter>;
    increment(): Counter | Promise<Counter>;
    decrement(): Counter | Promise<Counter>;
    reset(): Counter | Promise<Counter>;
    set(value: number): Counter | Promise<Counter>;
}

export function createMemoryStore(): CounterStore {
    const counter: Counter = { value: 0 };

    return {
        get: () => counter,
        increment: () => {
            counter.value++;
            return counter;
        },
        decrement: () => {
            counter.value--;
            return counter;
        },
        reset: () => {
            counter.value = 0;
            return counter;
        },
        set: (value) => {
            counter.value = value;
            return counter;
        }
    };
}
