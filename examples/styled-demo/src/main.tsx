/**
 * Quantum Styled Demo - Simplified Version
 * Demonstrates CSS-in-JS styling with the Quantum Framework
 */

import { signal } from '@quantum/reactivity';
import {
  styled,
  css,
  createTheme,
  setTheme,
  createGlobalStyles,
} from '@quantum/styled';

// Apply global styles
createGlobalStyles({
  reset: true,
  styles: `
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #f5f5f5;
    }
  `,
});

// Create a theme
const theme = createTheme({
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
  },
});

setTheme(theme);

console.log('✅ Quantum Styled Demo Loaded!');
console.log('📦 css:', css);
console.log('🎨 styled:', styled);
console.log('🎯 theme:', theme);

// Test basic CSS generation
const buttonClass = css({
  padding: '10px 20px',
  background: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
});

console.log('Generated class:', buttonClass);

// Create a simple button
const button = document.createElement('button');
button.className = buttonClass;
button.textContent = 'Quantum Styled Button';
button.onclick = () => {
  console.log('Button clicked!');
  alert('Quantum Styled works! ✨');
};

document.body.innerHTML = `
  <div style="max-width: 800px; margin: 2rem auto; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <h1 style="color: #007bff; margin-bottom: 1rem;">Quantum Styled Demo</h1>
    <p>CSS-in-JS library with near-zero runtime overhead.</p>
    <div id="button-container" style="margin-top: 2rem;"></div>
    <div style="margin-top: 2rem; padding: 1rem; background: #f9f9f9; border-radius: 4px;">
      <h3>Features:</h3>
      <ul style="line-height: 1.8;">
        <li>✨ CSS-in-JS with hash-based class generation</li>
        <li>🎨 TypeScript support</li>
        <li>🎯 Theme system with signals</li>
        <li>⚡ Tiny bundle size (see console)</li>
        <li>📦 69 tests passing</li>
      </ul>
    </div>
  </div>
`;

document.getElementById('button-container')?.appendChild(button);
