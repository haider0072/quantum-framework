# @quantum/router

Signal-based router for Quantum Framework with TypeScript support.

## Features

- **Signal-Based Reactivity**: Seamless integration with Quantum's reactivity system
- **Nested Routes**: Support for complex route hierarchies
- **Dynamic Parameters**: Extract params from URL paths (`:id`, `:userId`, etc.)
- **Navigation Guards**: beforeEach and afterEach hooks for route transitions
- **Link Component**: Navigation with automatic active state management
- **Multiple Modes**: Support for both history and hash-based routing
- **TypeScript**: Full type safety with TypeScript definitions
- **Lightweight**: Minimal bundle size, no virtual DOM overhead

## Installation

```bash
npm install @quantum/router
# or
pnpm add @quantum/router
```

## Basic Usage

```tsx
import { createRouter, RouterProvider, RouterView, Link } from '@quantum/router';

// Define routes
const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/about',
    name: 'about',
    component: About,
  },
  {
    path: '/user/:id',
    name: 'user',
    component: UserProfile,
  },
];

// Create router instance
const router = createRouter({
  routes,
  mode: 'history', // or 'hash'
  base: '',
});

// Use in your app
function App() {
  return (
    <RouterProvider router={router}>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/user/123">User 123</Link>
      </nav>
      <RouterView />
    </RouterProvider>
  );
}
```

## Route Configuration

### Basic Routes

```typescript
const routes = [
  {
    path: '/home',
    name: 'home',
    component: Home,
    meta: { requiresAuth: false },
  },
];
```

### Dynamic Parameters

```typescript
const routes = [
  {
    path: '/user/:userId/post/:postId',
    name: 'post',
    component: Post,
  },
];

// Access params in component
function Post() {
  const params = useParams();
  // params.userId and params.postId are available
}
```

### Nested Routes

```typescript
const routes = [
  {
    path: '/admin',
    name: 'admin',
    component: AdminLayout,
    children: [
      {
        path: '/dashboard',
        name: 'admin-dashboard',
        component: Dashboard,
      },
      {
        path: '/users',
        name: 'admin-users',
        component: Users,
      },
    ],
  },
];
```

### Wildcards

```typescript
const routes = [
  {
    path: '/docs/*',
    name: 'docs',
    component: Documentation,
  },
];
```

### Redirects

```typescript
const routes = [
  {
    path: '/old-path',
    redirect: '/new-path',
  },
  // Or dynamic redirect
  {
    path: '/user/:id',
    redirect: (to) => `/profile/${to.params.id}`,
  },
];
```

## Navigation

### Programmatic Navigation

```typescript
import { useNavigate } from '@quantum/router';

function MyComponent() {
  const navigate = useNavigate();

  const goToUser = () => {
    navigate.push('/user/123');
  };

  const replaceRoute = () => {
    navigate.replace('/about');
  };

  const goBack = () => {
    navigate.back();
  };

  return (
    <div>
      <button onClick={goToUser}>Go to User</button>
      <button onClick={replaceRoute}>Replace with About</button>
      <button onClick={goBack}>Go Back</button>
    </div>
  );
}
```

### Link Component

```tsx
import { Link } from '@quantum/router';

// Basic link
<Link to="/about">About</Link>

// With custom active classes
<Link
  to="/about"
  activeClass="is-active"
  exactActiveClass="is-exact-active"
>
  About
</Link>

// Replace instead of push
<Link to="/about" replace>
  About
</Link>

// With additional props
<Link to="/about" class="nav-link" onClick={handleClick}>
  About
</Link>
```

## Navigation Guards

### Global Guards

```typescript
// Before each navigation
router.beforeEach((to, from, next) => {
  if (to.meta?.requiresAuth && !isAuthenticated()) {
    // Redirect to login
    next('/login');
  } else {
    // Continue navigation
    next();
  }
});

// After each navigation
router.afterEach((to, from) => {
  // Analytics tracking
  trackPageView(to.path);
});
```

### Route-Level Guards

```typescript
const routes = [
  {
    path: '/admin',
    component: Admin,
    beforeEnter: (to, from, next) => {
      if (!isAdmin()) {
        next('/unauthorized');
      } else {
        next();
      }
    },
  },
];
```

## Hooks

### useRouter

Get access to the router instance:

```typescript
import { useRouter } from '@quantum/router';

function MyComponent() {
  const router = useRouter();
  // Access router.currentRoute, router.push, etc.
}
```

### useRoute

Get the current route:

```typescript
import { useRoute } from '@quantum/router';

function MyComponent() {
  const route = useRoute();
  // route.path, route.params, route.query, etc.
}
```

### useParams

Get route parameters:

```typescript
import { useParams } from '@quantum/router';

function UserProfile() {
  const params = useParams();
  const userId = params.id;
}
```

### useQuery

Get query parameters:

```typescript
import { useQuery } from '@quantum/router';

function SearchResults() {
  const query = useQuery();
  const searchTerm = query.q; // ?q=search+term
}
```

### useNavigate

Get navigation methods:

```typescript
import { useNavigate } from '@quantum/router';

function MyComponent() {
  const navigate = useNavigate();

  return (
    <div>
      <button onClick={() => navigate.push('/about')}>About</button>
      <button onClick={() => navigate.replace('/home')}>Home</button>
      <button onClick={() => navigate.back()}>Back</button>
      <button onClick={() => navigate.forward()}>Forward</button>
      <button onClick={() => navigate.go(-2)}>Go -2</button>
    </div>
  );
}
```

## Router Options

```typescript
interface RouterOptions {
  // Route configurations
  routes: RouteConfig[];

  // Base path for all routes
  base?: string;

  // Routing mode: 'history' or 'hash'
  mode?: 'history' | 'hash';

  // Custom scroll behavior
  scrollBehavior?: (to: Route, from: Route) => { x: number; y: number } | null;
}
```

### Scroll Behavior

```typescript
const router = createRouter({
  routes,
  scrollBehavior(to, from) {
    // Always scroll to top
    return { x: 0, y: 0 };

    // Or scroll to saved position
    if (to.hash) {
      return { x: 0, y: document.querySelector(to.hash)?.offsetTop || 0 };
    }
  },
});
```

## Route Object

The route object contains:

```typescript
interface Route {
  // Current path
  path: string;

  // Route parameters (:id, etc.)
  params: Record<string, string>;

  // Query parameters (?foo=bar)
  query: Record<string, string>;

  // Hash fragment (#section)
  hash: string;

  // Route name
  name?: string;

  // Route metadata
  meta?: Record<string, any>;

  // All matched routes (for nested routes)
  matched: RouteConfig[];
}
```

## TypeScript

The router is fully typed:

```typescript
import type { Router, Route, RouteConfig, NavigationGuard } from '@quantum/router';

// Type-safe route config
const routes: RouteConfig[] = [
  {
    path: '/user/:id',
    name: 'user',
    component: UserProfile,
    meta: { requiresAuth: true },
  },
];

// Type-safe navigation guard
const authGuard: NavigationGuard = (to, from, next) => {
  if (to.meta?.requiresAuth && !isAuthenticated()) {
    next('/login');
  } else {
    next();
  }
};
```

## Examples

### Authentication Flow

```typescript
const router = createRouter({
  routes: [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    {
      path: '/dashboard',
      component: Dashboard,
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach((to, from, next) => {
  if (to.meta?.requiresAuth && !store.isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});
```

### Layout with Nested Routes

```typescript
function AdminLayout() {
  return (
    <div class="admin-layout">
      <aside>
        <Link to="/admin/dashboard">Dashboard</Link>
        <Link to="/admin/users">Users</Link>
        <Link to="/admin/settings">Settings</Link>
      </aside>
      <main>
        <RouterView />
      </main>
    </div>
  );
}

const routes = [
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      { path: '/dashboard', component: Dashboard },
      { path: '/users', component: Users },
      { path: '/settings', component: Settings },
    ],
  },
];
```

### Dynamic Breadcrumbs

```typescript
function Breadcrumbs() {
  const route = useRoute();

  return (
    <nav>
      {route.matched.map((r, index) => (
        <span key={index}>
          {r.meta?.breadcrumb || r.name}
          {index < route.matched.length - 1 && ' > '}
        </span>
      ))}
    </nav>
  );
}
```

## Testing

The router package includes comprehensive tests:

```bash
pnpm test
```

Test coverage includes:
- Path to regex conversion
- Parameter extraction
- Nested route matching
- Wildcard matching
- Query string parsing
- Path normalization
- Relative path resolution

## License

MIT
