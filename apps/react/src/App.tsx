import { useState } from 'react'

import './App.css'

const API_URL = 'http://localhost:8787';

function App() {
  const [todos, setTodos] = useState<any[]>([]);
  const [newTodo, setNewTodo] = useState('');

  const handleCreate = async () => {
    if (newTodo.trim()) {
      await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTodo, completed: false })
      });
      setNewTodo('');
      handleGetAll();
    }
  };

  const handleGetAll = async () => {
    const response = await fetch(`${API_URL}/todos`);
    const allTodos = await response.json();
    setTodos(allTodos);
  };

  return (
    <div>
      <input
        type="text"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        placeholder="Enter todo"
      />
      <button onClick={handleCreate}>Create</button>

      <div>
        <h2>Todos</h2>
        <button onClick={handleGetAll}>Get All Todos</button>
        <ul>
          {todos.map((todo, index) => (
            <li key={index}>{JSON.stringify(todo)}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App
