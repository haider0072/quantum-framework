/**
 * Quantum Framework - Entry Point
 */

import { render } from '@quantum/renderer';
import { App } from './App';

// Render the app
const root = document.getElementById('root');
if (root) {
  render(<App />, root);
} else {
  console.error('Root element not found');
}
