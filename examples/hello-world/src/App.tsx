/**
 * Quantum Framework - Hello World Example
 *
 * A simple counter app demonstrating Quantum's reactivity system.
 */

import { signal, computed } from '@quantum/reactivity';

export function App() {
  // Create reactive state
  const count = signal(0);
  const doubled = computed(() => count() * 2);

  // Event handlers
  const increment = () => count.update((n) => n + 1);
  const decrement = () => count.update((n) => n - 1);
  const reset = () => count(0);

  return (
    <div style="font-family: system-ui; max-width: 600px; margin: 50px auto; text-align: center;">
      <h1 style="color: #6366f1;">Hello Quantum! 🚀</h1>

      <p style="font-size: 18px; color: #64748b;">
        Welcome to the future of web frameworks - extremely easy, blazingly fast, and ultra lightweight!
      </p>

      <div style="margin: 40px 0; padding: 30px; background: #f8fafc; border-radius: 12px; border: 2px solid #e2e8f0;">
        <h2 style="margin: 0 0 20px 0; color: #0f172a;">Interactive Counter</h2>

        <div style="font-size: 48px; font-weight: bold; color: #6366f1; margin: 20px 0;">
          {count()}
        </div>

        <div style="font-size: 20px; color: #64748b; margin: 10px 0;">
          Doubled: {doubled()}
        </div>

        <div style="margin-top: 30px; display: flex; gap: 10px; justify-content: center;">
          <button
            onClick={decrement}
            style="padding: 12px 24px; font-size: 16px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;"
          >
            - Decrement
          </button>

          <button
            onClick={reset}
            style="padding: 12px 24px; font-size: 16px; background: #64748b; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;"
          >
            Reset
          </button>

          <button
            onClick={increment}
            style="padding: 12px 24px; font-size: 16px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;"
          >
            + Increment
          </button>
        </div>
      </div>

      <div style="margin-top: 40px; padding: 20px; background: #ecfdf5; border-radius: 8px; border-left: 4px solid #10b981;">
        <h3 style="margin: 0 0 10px 0; color: #065f46;">What makes Quantum special?</h3>
        <ul style="text-align: left; color: #064e3b; line-height: 1.8;">
          <li><strong>Signal-based reactivity</strong> - No VDOM overhead</li>
          <li><strong>Compile-time optimizations</strong> - Maximum performance</li>
          <li><strong>Ultra lightweight</strong> - Core under 5KB</li>
          <li><strong>Extremely easy to use</strong> - Intuitive API</li>
          <li><strong>Multi-platform</strong> - Web, iOS, and Android</li>
        </ul>
      </div>

      <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8;">
        <p>Built with Quantum Framework v0.0.1</p>
        <p style="font-size: 14px;">The only framework you'll ever need</p>
      </footer>
    </div>
  );
}
