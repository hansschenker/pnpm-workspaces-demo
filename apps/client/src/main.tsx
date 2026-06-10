import { hc } from 'hono/client';

import { render } from '@netxpert/jsx';
import type { AppType } from '@netxpert/api';
import type { Counter } from '@netxpert/schema';

// Typed RPC client: routes, methods and response shapes are checked
// against the api package at compile time. In dev, requests go to the
// Vite dev server, which proxies /counter to the API (vite.config.ts);
// production builds bake in the deployed API URL (.env.production).
const client = hc<AppType>(import.meta.env.VITE_API_URL ?? window.location.origin);

const root = document.getElementById('root')!;

let counter: Counter = { value: 0 };

type CounterResponse = { json(): Promise<Counter> };

function App() {
    return (
        <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
            <h1>Counter Demo</h1>
            <h2 style={{ fontSize: '3rem', margin: '20px' }}>{counter.value}</h2>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <CounterButton label="+1" action={() => client.counter.increment.$post()} />
                <CounterButton label="-1" action={() => client.counter.decrement.$post()} />
                <CounterButton label="Reset" action={() => client.counter.reset.$post()} />
            </div>
        </div>
    );
}

function CounterButton(props: { label: string; action: () => Promise<CounterResponse> }) {
    return (
        <button
            onclick={async () => {
                const response = await props.action();
                counter = await response.json();
                rerender();
            }}
            style={{ fontSize: '1.5rem', padding: '10px 20px' }}
        >
            {props.label}
        </button>
    );
}

async function fetchCounter() {
    const response = await client.counter.$get();
    counter = await response.json();
    rerender();
}

function rerender() {
    render(<App />, root);
}

rerender();
fetchCounter();
