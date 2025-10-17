# @quantum/store

Signal-based global state management for Quantum Framework.

## Features

- 🎯 **Signal-Based** - Built on Quantum's reactive primitives
- 🪝 **React-like Hooks** - Familiar API for component integration
- 🔄 **Actions & Mutations** - Clear state update patterns
- 🧩 **Composable** - Modular stores for large applications
- 💾 **Persistence** - Built-in localStorage/sessionStorage support
- 🔌 **Middleware** - Extensible with custom middleware
- 🛠️ **DevTools** - Time-travel debugging support
- 📦 **TypeScript** - Full type inference
- 🪶 **Lightweight** - Zero external dependencies

## Installation

```bash
npm install @quantum/store
# or
pnpm add @quantum/store
```

## Quick Start

### Basic Store

```typescript
import { createStore } from '@quantum/store';

const counterStore = createStore({
  state: {
    count: 0,
  },
  getters: {
    doubled: (state) => state.count * 2,
  },
  actions: {
    increment(state) {
      state.count++;
    },
    incrementBy(state, amount: number) {
      state.count += amount;
    },
  },
});
```

### Using in Components

```typescript
import { useStore } from '@quantum/store';

function Counter() {
  const count = useStore(counterStore, (state) => state.count);
  const doubled = useStore(counterStore, (state) => state.doubled);

  return (
    <div>
      <h1>Count: {count}</h1>
      <p>Doubled: {doubled}</p>
      <button onClick={() => counterStore.increment()}>Increment</button>
      <button onClick={() => counterStore.incrementBy(5)}>+5</button>
    </div>
  );
}
```

## API Reference

### `createStore(config)`

Creates a new store instance.

**Parameters:**
- `state`: Initial state object
- `getters?`: Computed values derived from state
- `actions?`: Functions to modify state

**Returns:** Store instance with state signals and action methods

### `useStore(store, selector)`

React-like hook to subscribe to store state in components.

**Parameters:**
- `store`: Store instance
- `selector`: Function to select a slice of state

**Returns:** Selected value (reactive)

### Store Methods

- `store.getState()` - Get current state snapshot
- `store.subscribe(listener)` - Subscribe to state changes
- `store.reset()` - Reset to initial state

## Advanced Usage

### Async Actions

```typescript
const userStore = createStore({
  state: {
    user: null,
    loading: false,
    error: null,
  },
  actions: {
    async fetchUser(state, userId: string) {
      state.loading = true;
      state.error = null;
      try {
        const response = await fetch(`/api/users/${userId}`);
        state.user = await response.json();
      } catch (error) {
        state.error = error.message;
      } finally {
        state.loading = false;
      }
    },
  },
});
```

### Store Composition

```typescript
import { combineStores } from '@quantum/store';

const rootStore = combineStores({
  counter: counterStore,
  user: userStore,
  todos: todoStore,
});
```

### Persistence

```typescript
import { createStore, persist } from '@quantum/store';

const persistedStore = createStore({
  state: { theme: 'light' },
  actions: {
    setTheme(state, theme) {
      state.theme = theme;
    },
  },
  plugins: [
    persist({
      key: 'app-theme',
      storage: localStorage,
      paths: ['theme'], // Only persist specific paths
    }),
  ],
});
```

### Middleware

```typescript
import { createStore, logger } from '@quantum/store';

const store = createStore({
  state: { count: 0 },
  actions: {
    increment(state) {
      state.count++;
    },
  },
  middleware: [
    logger({ collapsed: true }),
    // Custom middleware
    (store) => (next) => (action) => {
      console.log('Before:', action);
      const result = next(action);
      console.log('After:', store.getState());
      return result;
    },
  ],
});
```

## License

MIT
