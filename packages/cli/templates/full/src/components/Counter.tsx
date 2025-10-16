import { signal, computed } from '@quantum/core/reactivity';

export function Counter() {
  const count = signal(0);
  const doubled = computed(() => count.value * 2);

  return (
    <div class="card">
      <h2>Counter Demo</h2>

      <div class="counter-display">
        <div class="stat">
          <span class="label">Count:</span>
          <span class="value">{count}</span>
        </div>
        <div class="stat">
          <span class="label">Doubled:</span>
          <span class="value">{doubled}</span>
        </div>
      </div>

      <div class="button-group">
        <button onClick={() => count.value--}>-</button>
        <button onClick={() => (count.value = 0)}>Reset</button>
        <button onClick={() => count.value++}>+</button>
      </div>
    </div>
  );
}
