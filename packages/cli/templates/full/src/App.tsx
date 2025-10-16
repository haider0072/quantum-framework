import { signal, computed } from '@quantum/core/reactivity';
import { Counter } from './components/Counter';
import { TodoList } from './components/TodoList';

export function App() {
  const activeTab = signal<'counter' | 'todos'>('counter');

  const tabClass = (tab: 'counter' | 'todos') =>
    computed(() => (activeTab.value === tab ? 'tab active' : 'tab'));

  return (
    <div class="app">
      <header>
        <h1>Quantum Framework</h1>
        <p>Full-featured template with components and state management</p>
      </header>

      <nav class="tabs">
        <button class={tabClass('counter')} onClick={() => (activeTab.value = 'counter')}>
          Counter
        </button>
        <button class={tabClass('todos')} onClick={() => (activeTab.value = 'todos')}>
          Todo List
        </button>
      </nav>

      <main>
        {computed(() => (
          activeTab.value === 'counter' ? <Counter /> : <TodoList />
        ))}
      </main>

      <footer>
        <p>Edit <code>src/App.tsx</code> to get started</p>
      </footer>
    </div>
  );
}
