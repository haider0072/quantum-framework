/**
 * Transition component for enter/leave animations
 */

import type { TransitionProps, TransitionPhase } from '../types.js';

const TRANSITION_STATE = Symbol('transitionState');

/**
 * Get transition class names
 */
function getTransitionClasses(name: string, props: TransitionProps): Record<TransitionPhase, string> {
  return {
    'enter-from': props.enterFromClass || `${name}-enter-from`,
    'enter-active': props.enterActiveClass || `${name}-enter-active`,
    'enter-to': props.enterToClass || `${name}-enter-to`,
    'leave-from': props.leaveFromClass || `${name}-leave-from`,
    'leave-active': props.leaveActiveClass || `${name}-leave-active`,
    'leave-to': props.leaveToClass || `${name}-leave-to`,
  };
}

/**
 * Get transition duration
 */
function getTransitionDuration(props: TransitionProps, phase: 'enter' | 'leave'): number {
  if (typeof props.duration === 'number') {
    return props.duration;
  }
  if (props.duration && typeof props.duration === 'object') {
    return props.duration[phase];
  }
  // Auto-detect from CSS
  return 0;
}

/**
 * Auto-detect transition duration from computed styles
 */
function getAutoDuration(el: HTMLElement): number {
  const styles = window.getComputedStyle(el);
  const transitionDuration = styles.transitionDuration || styles.webkitTransitionDuration || '0s';
  const animationDuration = styles.animationDuration || styles.webkitAnimationDuration || '0s';

  const parseDuration = (str: string): number => {
    const num = parseFloat(str);
    return str.indexOf('ms') > -1 ? num : num * 1000;
  };

  return Math.max(
    parseDuration(transitionDuration),
    parseDuration(animationDuration)
  );
}

/**
 * Perform enter transition
 */
export function performEnter(
  el: HTMLElement,
  props: TransitionProps,
  done?: () => void
): void {
  const name = props.name || 'v';
  const classes = getTransitionClasses(name, props);
  const css = props.css !== false;

  // Call beforeEnter hook
  if (props.beforeEnter) {
    props.beforeEnter(el);
  }

  if (css) {
    // Add enter-from and enter-active classes
    el.classList.add(classes['enter-from'], classes['enter-active']);

    // Force reflow to apply enter-from styles
    el.offsetHeight;

    // Next frame: remove enter-from, add enter-to
    requestAnimationFrame(() => {
      el.classList.remove(classes['enter-from']);
      el.classList.add(classes['enter-to']);

      // Call enter hook
      if (props.enter) {
        props.enter(el, () => {
          finishEnter();
        });
      } else {
        // Auto-finish after duration
        const duration = getTransitionDuration(props, 'enter') || getAutoDuration(el);
        setTimeout(() => {
          finishEnter();
        }, duration);
      }
    });
  } else if (props.enter) {
    // JS-only transition
    props.enter(el, () => {
      finishEnter();
    });
  } else {
    finishEnter();
  }

  function finishEnter() {
    if (css) {
      el.classList.remove(classes['enter-active'], classes['enter-to']);
    }
    if (props.afterEnter) {
      props.afterEnter(el);
    }
    if (done) {
      done();
    }
  }
}

/**
 * Perform leave transition
 */
export function performLeave(
  el: HTMLElement,
  props: TransitionProps,
  done?: () => void
): void {
  const name = props.name || 'v';
  const classes = getTransitionClasses(name, props);
  const css = props.css !== false;

  // Call beforeLeave hook
  if (props.beforeLeave) {
    props.beforeLeave(el);
  }

  if (css) {
    // Add leave-from and leave-active classes
    el.classList.add(classes['leave-from'], classes['leave-active']);

    // Force reflow
    el.offsetHeight;

    // Next frame: remove leave-from, add leave-to
    requestAnimationFrame(() => {
      el.classList.remove(classes['leave-from']);
      el.classList.add(classes['leave-to']);

      // Call leave hook
      if (props.leave) {
        props.leave(el, () => {
          finishLeave();
        });
      } else {
        // Auto-finish after duration
        const duration = getTransitionDuration(props, 'leave') || getAutoDuration(el);
        setTimeout(() => {
          finishLeave();
        }, duration);
      }
    });
  } else if (props.leave) {
    // JS-only transition
    props.leave(el, () => {
      finishLeave();
    });
  } else {
    finishLeave();
  }

  function finishLeave() {
    if (css) {
      el.classList.remove(classes['leave-active'], classes['leave-to']);
    }
    if (props.afterLeave) {
      props.afterLeave(el);
    }
    if (done) {
      done();
    }
  }
}

/**
 * Create a Transition component
 */
export function Transition(props: TransitionProps & { children: any }) {
  // This would be implemented as a proper component
  // For now, return a wrapper function
  return {
    type: 'transition',
    props,
    children: props.children,
  };
}

/**
 * Helper to apply transition to v-if/v-show
 */
export function withTransition(
  el: HTMLElement,
  show: boolean,
  props?: TransitionProps
): void {
  if (!props) {
    return;
  }

  let state = (el as any)[TRANSITION_STATE];

  if (!state) {
    state = { isShowing: !show };
    (el as any)[TRANSITION_STATE] = state;
  }

  if (show && !state.isShowing) {
    // Entering
    performEnter(el, props, () => {
      state.isShowing = true;
    });
  } else if (!show && state.isShowing) {
    // Leaving
    performLeave(el, props, () => {
      state.isShowing = false;
    });
  }
}
