import { useState, useEffect } from 'react'
import type { Counter } from '@jilles/schema'
import './App.css'


const API_URL = 'http://localhost:3000';

function App() {
  const [counter, setCounter] = useState<Counter>({ value: 0 });

  const fetchCounter = async () => {
    const response = await fetch(`${API_URL}/counter`);
    const data = await response.json();
    setCounter(data);
  };

  useEffect(() => {
    fetchCounter();
  }, []);

  const handleIncrement = async () => {
    const response = await fetch(`${API_URL}/counter/increment`, {
      method: 'POST'
    });
    const data = await response.json();
    setCounter(data);
  };

  const handleDecrement = async () => {
    const response = await fetch(`${API_URL}/counter/decrement`, {
      method: 'POST'
    });
    const data = await response.json();
    setCounter(data);
  };

  const handleReset = async () => {
    const response = await fetch(`${API_URL}/counter/reset`, {
      method: 'POST'
    });
    const data = await response.json();
    setCounter(data);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Counter Demo</h1>
      <h2 style={{ fontSize: '3rem', margin: '20px' }}>{counter.value}</h2>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button onClick={handleIncrement} style={{ fontSize: '1.5rem', padding: '10px 20px' }}>
          +1
        </button>
        <button onClick={handleDecrement} style={{ fontSize: '1.5rem', padding: '10px 20px' }}>
          -1
        </button>
        <button onClick={handleReset} style={{ fontSize: '1.5rem', padding: '10px 20px' }}>
          Reset
        </button>
      </div>
    </div>
  )
}

export default App
