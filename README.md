# Quantum Framework

<div align="center">

**A lightning-fast, signal-based reactive framework for building modern web applications**

[![Tests](https://img.shields.io/badge/tests-98%2F98%20passing-brightgreen)]()
[![Bundle Size](https://img.shields.io/badge/bundle%20size-2.7KB%20gzipped-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)]()

[Getting Started](#-getting-started) • [Documentation](#-documentation) • [Examples](#-examples) • [Roadmap](#-roadmap)

</div>

---

## What is Quantum?

Quantum is a modern JavaScript framework that combines the best ideas from React, Vue, and Solid.js into a cohesive, performant package. Built from scratch with zero dependencies, Quantum delivers blazing-fast performance through signal-based reactivity and compile-time optimizations.

### Why Quantum?

- **🚀 Blazing Fast** - 2.7KB gzipped core, signal-based reactivity with zero VDOM overhead
- **💎 Developer Experience** - Familiar JSX/TSX syntax, full TypeScript support, intuitive API
- **⚡ Smart Compiler** - Compile-time optimizations for maximum runtime performance
- **🎯 Production Ready** - Comprehensive test coverage (98/98 tests passing)
- **🛠️ Complete Tooling** - CLI for scaffolding, dev server, and production builds
- **📦 Batteries Included** - Client-side router, state management (coming soon), and more

---

## ✨ Features

### Core Framework

- **Signal-Based Reactivity** - Fine-grained reactive system with automatic dependency tracking
- **Computed Values** - Lazy evaluation with smart caching and invalidation
- **Effects System** - Automatic side-effect execution with cleanup management
- **Batch Updates** - Multiple state updates in a single render pass
- **JSX/TSX Support** - Modern JSX transform with full TypeScript support
- **Lifecycle Hooks** - onMount, onCleanup, onUpdate, onError
- **Context API** - Component data propagation with reactive contexts
- **Code Splitting** - Lazy loading and Suspense support
- **Portals** - Render components outside the DOM hierarchy

### Routing

- **Signal-Based Router** - Client-side routing with reactivity integration
- **Multiple Modes** - History API and hash-based routing
- **Dynamic Routes** - Parameter extraction (`:id`, `:userId`)
- **Nested Routes** - Parent-child route hierarchies
- **Navigation Guards** - beforeEach, afterEach, beforeEnter hooks
- **Link Component** - Automatic active state management
- **TypeScript Support** - Fully typed route definitions

### Developer Tools

- **CLI Tool** - Scaffold projects with `create-quantum-app`
- **Dev Server** - Fast development with Vite integration
- **Production Builds** - Optimized builds with minification
- **Hot Module Replacement** - Instant feedback during development
- **Source Maps** - Full debugging support
- **TypeScript** - First-class TypeScript support

---

## 🚀 Getting Started

### Quick Start

Create a new Quantum app in seconds:

```bash
# Using npm
npm create quantum-app my-app

# Using pnpm
pnpm create quantum-app my-app

# Using yarn
yarn create quantum-app my-app
```

Then start developing:

```bash
cd my-app
pnpm dev
```

### Choose Your Template

Quantum provides three starter templates:

- **basic** - Minimal setup with JSX (perfect for learning)
- **typescript** - Full TypeScript configuration
- **full** - Feature-rich template with components and styling

```bash
create-quantum-app my-app --template typescript
```

---

## 📝 Your First Component

```tsx
import { signal, computed } from '@quantum/core/reactivity';

export function Counter() {
  const count = signal(0);
  const doubled = computed(() => count.value * 2);

  return (
    <div>
      <h1>Counter: {count}</h1>
      <p>Doubled: {doubled}</p>
      <button onClick={() => count.value++}>Increment</button>
    </div>
  );
}
```

### How It Works

1. **Signals** store reactive state
2. **Computed** values automatically update when dependencies change
3. **JSX** compiles to optimized function calls
4. **No VDOM** - direct DOM updates for maximum performance

---

## 💡 Core Concepts

### Signals

Signals are the fundamental building block of reactivity in Quantum:

```tsx
import { signal } from '@quantum/core/reactivity';

// Create a signal
const count = signal(0);

// Read value
console.log(count.value); // 0

// Update value
count.value = 10;

// Subscribe to changes
count.subscribe((newValue) => {
  console.log('Count changed:', newValue);
});
```

### Computed Values

Computed values automatically recalculate when their dependencies change:

```tsx
import { signal, computed } from '@quantum/core/reactivity';

const firstName = signal('John');
const lastName = signal('Doe');

const fullName = computed(() => `${firstName.value} ${lastName.value}`);

console.log(fullName.value); // "John Doe"

firstName.value = 'Jane';
console.log(fullName.value); // "Jane Doe"
```

### Effects

Effects run automatically when their dependencies change:

```tsx
import { signal, effect } from '@quantum/core/reactivity';

const count = signal(0);

effect(() => {
  console.log('Count is:', count.value);
});

count.value = 5; // Logs: "Count is: 5"
```

### Batch Updates

Batch multiple state updates for optimal performance:

```tsx
import { signal, batch } from '@quantum/core/reactivity';

const x = signal(0);
const y = signal(0);

batch(() => {
  x.value = 10;
  y.value = 20;
  // Only one re-render happens here
});
```

---

## 🏗️ Project Structure

```
quantum-framework/
├── core/
│   ├── reactivity/         # Signal-based reactivity system
│   │   ├── src/
│   │   │   ├── signal.ts      # Signal primitive
│   │   │   ├── computed.ts    # Computed values
│   │   │   ├── effect.ts      # Effect system
│   │   │   ├── batch.ts       # Batch updates
│   │   │   └── tracking.ts    # Dependency tracking
│   │   └── __tests__/         # 46 tests
│   ├── component/          # Component model & JSX
│   │   └── src/
│   │       ├── jsx-runtime.ts # JSX transform
│   │       ├── lifecycle.ts   # Lifecycle hooks
│   │       ├── context.ts     # Context API
│   │       └── component.ts   # Component utilities
│   └── renderer/           # DOM rendering
│       └── src/
│           ├── dom.ts         # DOM operations
│           └── render.ts      # Render API
├── packages/
│   ├── compiler/           # JSX/TSX compiler
│   │   ├── src/
│   │   │   ├── parser.ts      # Babel parser
│   │   │   ├── transformer.ts # AST transformer
│   │   │   ├── generator.ts   # Code generator
│   │   │   └── vite-plugin.ts # Vite integration
│   │   └── __tests__/         # 28 tests
│   ├── cli/                # Command-line tool
│   │   ├── src/
│   │   │   ├── commands/      # CLI commands
│   │   │   │   ├── create.ts  # Project scaffolding
│   │   │   │   ├── dev.ts     # Dev server
│   │   │   │   ├── build.ts   # Production build
│   │   │   │   └── preview.ts # Build preview
│   │   │   └── index.ts       # CLI entry point
│   │   ├── templates/         # Project templates
│   │   │   ├── basic/
│   │   │   ├── typescript/
│   │   │   └── full/
│   │   └── __tests__/         # 6 tests
│   └── router/             # Client-side router
│       ├── src/
│       │   ├── types.ts       # Type definitions
│       │   ├── matcher.ts     # Route matching
│       │   ├── router.ts      # Router implementation
│       │   └── components.tsx # Router components
│       └── __tests__/         # 18 tests
├── examples/
│   └── hello-world/        # Example application
└── docs/                   # Documentation
    ├── ARCHITECTURE.md     # Technical architecture
    ├── ROADMAP.md          # Implementation roadmap
    └── PROGRESS.md         # Development progress
```

---

## 🧪 Examples

### Todo List

```tsx
import { signal } from '@quantum/core/reactivity';

function TodoList() {
  const todos = signal([
    { id: 1, text: 'Learn Quantum', completed: true },
    { id: 2, text: 'Build an app', completed: false },
  ]);

  const addTodo = (text: string) => {
    todos.value = [
      ...todos.value,
      { id: Date.now(), text, completed: false },
    ];
  };

  const toggleTodo = (id: number) => {
    todos.value = todos.value.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
  };

  return (
    <div>
      <h1>My Todos</h1>
      <ul>
        {todos.value.map((todo) => (
          <li
            key={todo.id}
            onClick={() => toggleTodo(todo.id)}
            style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
          >
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Form Handling

```tsx
import { signal } from '@quantum/core/reactivity';

function LoginForm() {
  const email = signal('');
  const password = signal('');

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    console.log('Login:', { email: email.value, password: password.value });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onInput={(e) => (email.value = e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onInput={(e) => (password.value = e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

---

## 📚 Documentation

### Core Packages

- **[@quantum/core/reactivity](./core/reactivity)** - Signal-based reactivity system
- **[@quantum/core/component](./core/component)** - Component model and JSX runtime
- **[@quantum/core/renderer](./core/renderer)** - DOM rendering engine

### Packages

- **[@quantum/compiler](./packages/compiler)** - JSX/TSX compiler and Vite plugin
- **[@quantum/cli](./packages/cli)** - Command-line interface
- **[@quantum/router](./packages/router)** - Client-side router with navigation guards

### Guides

- [Architecture Overview](./docs/ARCHITECTURE.md) - Deep dive into framework design
- [Development Roadmap](./docs/ROADMAP.md) - 20-week implementation plan
- [Progress Tracking](./docs/PROGRESS.md) - Current development status

---

## 🛠️ CLI Commands

### Development

```bash
# Start development server
quantum dev

# Build for production
quantum build

# Preview production build
quantum preview
```

### Options

```bash
# Custom port
quantum dev --port 8080

# Custom output directory
quantum build --outDir dist

# Disable minification
quantum build --no-minify
```

---

## 📊 Performance

### Bundle Size

Quantum is incredibly lightweight:

- **Core Framework**: 2.7KB gzipped
- **Including Compiler**: Still under 5KB gzipped
- **Hello World App**: 6.7KB total (2.7KB framework + 4KB app code)

### Runtime Performance

- **Signal Updates**: O(1) - direct subscriber notification
- **Computed Values**: Lazy evaluation with smart caching
- **DOM Updates**: Surgical updates, no VDOM diffing
- **Memory Usage**: Minimal overhead with automatic cleanup

### Benchmark Comparisons

| Framework | Bundle Size | Update Speed | Memory |
|-----------|-------------|--------------|---------|
| Quantum   | 2.7KB      | ⚡⚡⚡        | ✅ Low  |
| Solid.js  | 6.4KB      | ⚡⚡⚡        | ✅ Low  |
| Preact    | 4.5KB      | ⚡⚡          | ✅ Low  |
| Vue 3     | 34KB       | ⚡⚡          | ⚠️ Med  |
| React     | 42KB       | ⚡           | ⚠️ High |

---

## 🧪 Testing

Quantum has comprehensive test coverage:

```bash
# Run all tests
pnpm test

# Run specific package tests
cd core/reactivity && pnpm test
cd packages/compiler && pnpm test
cd packages/cli && pnpm test
cd packages/router && pnpm test

# Watch mode
pnpm test:watch
```

### Test Coverage

- **Reactivity System**: 46/46 tests passing
- **Compiler**: 28/28 tests passing
- **CLI**: 6/6 tests passing
- **Router**: 18/18 tests passing
- **Total**: 98/98 tests passing ✅

---

## 🗺️ Roadmap

### Phase 1: Foundation ✅ (Weeks 1-5) - COMPLETE

- [x] Signal-based reactivity system
- [x] Component model with JSX/TSX
- [x] DOM rendering engine
- [x] JSX/TSX compiler with Vite plugin
- [x] CLI tool with project scaffolding
- [x] Project templates (basic/typescript/full)
- [x] Client-side router with navigation guards

### Phase 2: Essential Features (Weeks 6-8)

- [ ] Global state management
- [ ] Styled components / CSS-in-JS
- [ ] Animations and transitions

### Phase 3: Advanced Features (Weeks 9-12)

- [ ] Server-side rendering (SSR)
- [ ] Static site generation (SSG)
- [ ] Error boundaries and recovery
- [ ] Streaming and suspense

### Phase 4: Developer Experience (Weeks 13-16)

- [ ] DevTools extension
- [ ] Performance profiler
- [ ] Component inspector
- [ ] Hot module replacement improvements

### Phase 5: Ecosystem (Weeks 17-20)

- [ ] Official component library
- [ ] Form validation library
- [ ] Internationalization (i18n)
- [ ] Testing utilities

See [ROADMAP.md](./docs/ROADMAP.md) for the complete 20-week plan.

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup

```bash
# Clone the repository
git clone https://github.com/haider0072/quantum-framework.git
cd quantum-framework

# Install dependencies
pnpm install

# Run tests
pnpm test

# Build all packages
pnpm build

# Run example app
cd examples/hello-world
pnpm dev
```

### Guidelines

1. **Code Style** - Follow existing TypeScript conventions
2. **Tests** - Add tests for new features
3. **Documentation** - Update relevant docs
4. **Commits** - Write clear, descriptive commit messages

---

## 📄 License

MIT License

Copyright (c) 2025 Haider Ali Khan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 🌟 Acknowledgments

Quantum Framework draws inspiration from:

- **React** - Component model and hooks pattern
- **Vue** - Reactive system and developer experience
- **Solid.js** - Signal-based reactivity
- **Svelte** - Compile-time optimizations

Special thanks to the open-source community for making projects like this possible.

---

## 📞 Connect

- **GitHub**: [haider0072](https://github.com/haider0072)
- **Repository**: [quantum-framework](https://github.com/haider0072/quantum-framework)
- **Issues**: [Report a bug](https://github.com/haider0072/quantum-framework/issues)

---

<div align="center">

**Built with passion to create the best framework possible.**

⭐ Star us on GitHub — it motivates us a lot!

</div>
