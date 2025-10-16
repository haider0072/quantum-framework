import { render } from '@quantum/core/renderer';
import { App } from './App';

const root = document.getElementById('app');
if (!root) throw new Error('Root element not found');

render(<App />, root);
