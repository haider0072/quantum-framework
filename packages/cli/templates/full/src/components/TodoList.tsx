import { signal, computed } from '@quantum/core/reactivity';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export function TodoList() {
  const todos = signal<Todo[]>([
    { id: 1, text: 'Learn Quantum Framework', completed: true },
    { id: 2, text: 'Build an app', completed: false },
    { id: 3, text: 'Deploy to production', completed: false },
  ]);
  const newTodoText = signal('');
  const filter = signal<'all' | 'active' | 'completed'>('all');

  const filteredTodos = computed(() => {
    const all = todos.value;
    if (filter.value === 'active') return all.filter((t) => !t.completed);
    if (filter.value === 'completed') return all.filter((t) => t.completed);
    return all;
  });

  const stats = computed(() => ({
    total: todos.value.length,
    active: todos.value.filter((t) => !t.completed).length,
    completed: todos.value.filter((t) => t.completed).length,
  }));

  const addTodo = () => {
    const text = newTodoText.value.trim();
    if (!text) return;

    todos.value = [
      ...todos.value,
      { id: Date.now(), text, completed: false },
    ];
    newTodoText.value = '';
  };

  const toggleTodo = (id: number) => {
    todos.value = todos.value.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
  };

  const deleteTodo = (id: number) => {
    todos.value = todos.value.filter((todo) => todo.id !== id);
  };

  return (
    <div class="card">
      <h2>Todo List</h2>

      <div class="todo-stats">
        <span>Total: {computed(() => stats.value.total)}</span>
        <span>Active: {computed(() => stats.value.active)}</span>
        <span>Completed: {computed(() => stats.value.completed)}</span>
      </div>

      <div class="todo-input">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={newTodoText}
          onInput={(e) => (newTodoText.value = (e.target as HTMLInputElement).value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />
        <button onClick={addTodo}>Add</button>
      </div>

      <div class="filter-buttons">
        <button
          class={computed(() => (filter.value === 'all' ? 'active' : ''))}
          onClick={() => (filter.value = 'all')}
        >
          All
        </button>
        <button
          class={computed(() => (filter.value === 'active' ? 'active' : ''))}
          onClick={() => (filter.value = 'active')}
        >
          Active
        </button>
        <button
          class={computed(() => (filter.value === 'completed' ? 'active' : ''))}
          onClick={() => (filter.value = 'completed')}
        >
          Completed
        </button>
      </div>

      <ul class="todo-list">
        {computed(() =>
          filteredTodos.value.map((todo) => (
            <li key={todo.id} class={todo.completed ? 'completed' : ''}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
              />
              <span>{todo.text}</span>
              <button class="delete" onClick={() => deleteTodo(todo.id)}>
                ×
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
