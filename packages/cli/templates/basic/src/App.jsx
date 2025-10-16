import { signal } from '@quantum/core/reactivity';

export function App() {
  const count = signal(0);

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1>Welcome to Quantum</h1>
      <p>A lightweight, signal-based reactive framework</p>

      <div style={{ marginTop: '20px' }}>
        <button onClick={() => count.value++}>
          Count: {count}
        </button>
      </div>

      <div style={{ marginTop: '20px', color: '#666' }}>
        <p>Edit <code>src/App.jsx</code> to get started.</p>
      </div>
    </div>
  );
}
