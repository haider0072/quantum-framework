// Core router
export { createRouter } from './router';
export { matchRoute, pathToRegex, parseQuery, normalizePath, resolvePath } from './matcher';

// Components and hooks
export {
  RouterProvider,
  RouterView,
  Link,
  useRouter,
  useRoute,
  useNavigate,
  useParams,
  useQuery,
} from './components';

// Types
export type {
  Router,
  RouterOptions,
  Route,
  RouteConfig,
  NavigationGuard,
} from './types';
