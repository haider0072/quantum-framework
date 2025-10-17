/**
 * Quantum Directives - Directives and transitions for Quantum Framework
 * @packageDocumentation
 */

// Export types
export type {
  Directive,
  DirectiveHooks,
  DirectiveBinding,
  TransitionProps,
  TransitionHooks,
  TransitionPhase,
  ForDirectiveOptions,
  ShowDirectiveOptions,
  IfDirectiveOptions,
} from './types.js';

// Export built-in directives
export { vShow, show } from './directives/show.js';
export { vIf, vElse, vElseIf } from './directives/if.js';
export { vFor } from './directives/for.js';

// Export custom directive API
export {
  registerDirective,
  getDirective,
  unregisterDirective,
  hasDirective,
  getDirectiveNames,
  applyDirective,
  updateDirective,
  removeDirective,
  defineDirective,
  createDirective,
} from './directives/custom.js';

// Export transition system
export {
  Transition,
  performEnter,
  performLeave,
  withTransition,
} from './transitions/transition.js';

// Re-export for convenience
export { vShow as Show };

// Version
export const version = '0.0.1';

// Auto-register built-in directives
import { registerDirective } from './directives/custom.js';
import { vShow } from './directives/show.js';
import { vIf, vElse, vElseIf } from './directives/if.js';
import { vFor } from './directives/for.js';

registerDirective('show', vShow);
registerDirective('if', vIf);
registerDirective('else', vElse);
registerDirective('else-if', vElseIf);
registerDirective('for', vFor);
