import { render } from '@jilles/jsx';
import type { Counter } from '@jilles/schema';

const API_URL = 'http://localhost:3000';

const root = document.getElementById('root')!;

let counter: Counter = { value: 0 };

function App() {
    return (
        <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
            <h1>Counter Demo</h1>
            <h2 style={{ fontSize: '3rem', margin: '20px' }}>{counter.value}</h2>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <CounterButton label="+1" path="/counter/increment" />
                <CounterButton label="-1" path="/counter/decrement" />
                <CounterButton label="Reset" path="/counter/reset" />
            </div>
        </div>
    );
}

function CounterButton(props: { label: string; path: string }) {
    return (
        <button onclick={() => update(props.path)} style={{ fontSize: '1.5rem', padding: '10px 20px' }}>
            {props.label}
        </button>
    );
}

async function update(path: string) {
    const response = await fetch(`${API_URL}${path}`, { method: 'POST' });
    counter = await response.json();
    rerender();
}

async function fetchCounter() {
    const response = await fetch(`${API_URL}/counter`);
    counter = await response.json();
    rerender();
}

function rerender() {
    render(<App />, root);
}

rerender();
fetchCounter();
