/**
 * Tests for transition system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { performEnter, performLeave, withTransition, Transition } from '../src/transitions/transition.js';
import type { TransitionProps } from '../src/types.js';

describe('Transition System', () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement('div');
    document.body.appendChild(el);
  });

  describe('performEnter', () => {
    it('should add CSS classes during enter transition', async () => {
      const props: TransitionProps = {
        name: 'fade',
      };

      performEnter(el, props);

      // Initially should have enter-from and enter-active
      expect(el.classList.contains('fade-enter-from')).toBe(true);
      expect(el.classList.contains('fade-enter-active')).toBe(true);

      // After requestAnimationFrame
      await new Promise(resolve => requestAnimationFrame(resolve));

      expect(el.classList.contains('fade-enter-from')).toBe(false);
      expect(el.classList.contains('fade-enter-to')).toBe(true);
      expect(el.classList.contains('fade-enter-active')).toBe(true);
    });

    it('should use custom CSS class names', async () => {
      const props: TransitionProps = {
        name: 'fade',
        enterFromClass: 'custom-enter-from',
        enterActiveClass: 'custom-enter-active',
        enterToClass: 'custom-enter-to',
      };

      performEnter(el, props);

      expect(el.classList.contains('custom-enter-from')).toBe(true);
      expect(el.classList.contains('custom-enter-active')).toBe(true);

      await new Promise(resolve => requestAnimationFrame(resolve));

      expect(el.classList.contains('custom-enter-to')).toBe(true);
    });

    it('should call beforeEnter hook', () => {
      const beforeEnter = vi.fn();
      const props: TransitionProps = {
        name: 'fade',
        beforeEnter,
      };

      performEnter(el, props);

      expect(beforeEnter).toHaveBeenCalledWith(el);
    });

    it('should call enter hook with done callback', async () => {
      const enter = vi.fn((el, done) => {
        setTimeout(done, 10);
      });

      const props: TransitionProps = {
        name: 'fade',
        enter,
      };

      await new Promise(resolve => {
        performEnter(el, props, resolve);
      });

      expect(enter).toHaveBeenCalled();
    });

    it('should call afterEnter hook when done', async () => {
      const afterEnter = vi.fn();
      const props: TransitionProps = {
        name: 'fade',
        duration: 10,
        afterEnter,
      };

      await new Promise(resolve => {
        performEnter(el, props, resolve);
      });

      // Wait for duration
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(afterEnter).toHaveBeenCalledWith(el);
    });

    it('should support JS-only transitions', async () => {
      const enter = vi.fn((el, done) => {
        el.style.opacity = '1';
        setTimeout(done, 10);
      });

      const props: TransitionProps = {
        name: 'fade',
        css: false,
        enter,
      };

      await new Promise(resolve => {
        performEnter(el, props, resolve);
      });

      expect(enter).toHaveBeenCalled();
      expect(el.style.opacity).toBe('1');
    });

    it('should use specified duration', async () => {
      const afterEnter = vi.fn();
      const props: TransitionProps = {
        name: 'fade',
        duration: 50,
        afterEnter,
      };

      const startTime = Date.now();

      await new Promise(resolve => {
        performEnter(el, props, resolve);
      });

      await new Promise(resolve => setTimeout(resolve, 60));

      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeGreaterThanOrEqual(50);
      expect(afterEnter).toHaveBeenCalled();
    });

    it('should support different enter and leave durations', async () => {
      const props: TransitionProps = {
        name: 'fade',
        duration: { enter: 100, leave: 200 },
      };

      const startTime = Date.now();

      await new Promise(resolve => {
        performEnter(el, props, resolve);
      });

      await new Promise(resolve => setTimeout(resolve, 110));

      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeGreaterThanOrEqual(100);
    });

    it('should cleanup classes after transition', async () => {
      const props: TransitionProps = {
        name: 'fade',
        duration: 10,
      };

      performEnter(el, props);

      await new Promise(resolve => requestAnimationFrame(resolve));
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(el.classList.contains('fade-enter-active')).toBe(false);
      expect(el.classList.contains('fade-enter-to')).toBe(false);
    });
  });

  describe('performLeave', () => {
    it('should add CSS classes during leave transition', async () => {
      const props: TransitionProps = {
        name: 'fade',
      };

      performLeave(el, props);

      expect(el.classList.contains('fade-leave-from')).toBe(true);
      expect(el.classList.contains('fade-leave-active')).toBe(true);

      await new Promise(resolve => requestAnimationFrame(resolve));

      expect(el.classList.contains('fade-leave-from')).toBe(false);
      expect(el.classList.contains('fade-leave-to')).toBe(true);
      expect(el.classList.contains('fade-leave-active')).toBe(true);
    });

    it('should use custom CSS class names', async () => {
      const props: TransitionProps = {
        name: 'fade',
        leaveFromClass: 'custom-leave-from',
        leaveActiveClass: 'custom-leave-active',
        leaveToClass: 'custom-leave-to',
      };

      performLeave(el, props);

      expect(el.classList.contains('custom-leave-from')).toBe(true);
      expect(el.classList.contains('custom-leave-active')).toBe(true);

      await new Promise(resolve => requestAnimationFrame(resolve));

      expect(el.classList.contains('custom-leave-to')).toBe(true);
    });

    it('should call beforeLeave hook', () => {
      const beforeLeave = vi.fn();
      const props: TransitionProps = {
        name: 'fade',
        beforeLeave,
      };

      performLeave(el, props);

      expect(beforeLeave).toHaveBeenCalledWith(el);
    });

    it('should call leave hook with done callback', async () => {
      const leave = vi.fn((el, done) => {
        setTimeout(done, 10);
      });

      const props: TransitionProps = {
        name: 'fade',
        leave,
      };

      await new Promise(resolve => {
        performLeave(el, props, resolve);
      });

      expect(leave).toHaveBeenCalled();
    });

    it('should call afterLeave hook when done', async () => {
      const afterLeave = vi.fn();
      const props: TransitionProps = {
        name: 'fade',
        duration: 10,
        afterLeave,
      };

      await new Promise(resolve => {
        performLeave(el, props, resolve);
      });

      await new Promise(resolve => setTimeout(resolve, 20));

      expect(afterLeave).toHaveBeenCalledWith(el);
    });

    it('should support JS-only transitions', async () => {
      const leave = vi.fn((el, done) => {
        el.style.opacity = '0';
        setTimeout(done, 10);
      });

      const props: TransitionProps = {
        name: 'fade',
        css: false,
        leave,
      };

      await new Promise(resolve => {
        performLeave(el, props, resolve);
      });

      expect(leave).toHaveBeenCalled();
      expect(el.style.opacity).toBe('0');
    });

    it('should cleanup classes after transition', async () => {
      const props: TransitionProps = {
        name: 'fade',
        duration: 10,
      };

      performLeave(el, props);

      await new Promise(resolve => requestAnimationFrame(resolve));
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(el.classList.contains('fade-leave-active')).toBe(false);
      expect(el.classList.contains('fade-leave-to')).toBe(false);
    });
  });

  describe('withTransition', () => {
    it('should perform enter transition when showing', async () => {
      const afterEnter = vi.fn();
      const props: TransitionProps = {
        name: 'fade',
        duration: 10,
        afterEnter,
      };

      withTransition(el, true, props);

      await new Promise(resolve => requestAnimationFrame(resolve));
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(afterEnter).toHaveBeenCalled();
    });

    it('should perform leave transition when hiding', async () => {
      const afterLeave = vi.fn();
      const props: TransitionProps = {
        name: 'fade',
        duration: 10,
        afterLeave,
      };

      // First show
      withTransition(el, true, props);
      await new Promise(resolve => setTimeout(resolve, 20));

      // Then hide
      withTransition(el, false, props);
      await new Promise(resolve => requestAnimationFrame(resolve));
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(afterLeave).toHaveBeenCalled();
    });

    it('should track transition state on element', () => {
      const props: TransitionProps = {
        name: 'fade',
      };

      withTransition(el, true, props);

      const symbols = Object.getOwnPropertySymbols(el);
      expect(symbols.length).toBeGreaterThan(0);
    });

    it('should do nothing when props is undefined', () => {
      withTransition(el, true, undefined);

      expect(el.classList.length).toBe(0);
    });

    it('should toggle between enter and leave', async () => {
      const afterEnter = vi.fn();
      const afterLeave = vi.fn();
      const props: TransitionProps = {
        name: 'fade',
        duration: 10,
        afterEnter,
        afterLeave,
      };

      // Enter
      withTransition(el, true, props);
      await new Promise(resolve => setTimeout(resolve, 20));
      expect(afterEnter).toHaveBeenCalled();

      // Leave
      withTransition(el, false, props);
      await new Promise(resolve => setTimeout(resolve, 20));
      expect(afterLeave).toHaveBeenCalled();

      // Enter again
      withTransition(el, true, props);
      await new Promise(resolve => setTimeout(resolve, 20));
      expect(afterEnter).toHaveBeenCalledTimes(2);
    });
  });

  describe('Transition component', () => {
    it('should create transition component wrapper', () => {
      const props: TransitionProps = {
        name: 'fade',
      };

      const result = Transition({ ...props, children: 'content' });

      expect(result.type).toBe('transition');
      expect(result.props.name).toBe('fade');
      expect(result.children).toBe('content');
    });

    it('should pass all props to wrapper', () => {
      const beforeEnter = vi.fn();
      const afterEnter = vi.fn();
      const props: TransitionProps = {
        name: 'slide',
        duration: 300,
        beforeEnter,
        afterEnter,
      };

      const result = Transition({ ...props, children: null });

      expect(result.props.name).toBe('slide');
      expect(result.props.duration).toBe(300);
      expect(result.props.beforeEnter).toBe(beforeEnter);
      expect(result.props.afterEnter).toBe(afterEnter);
    });
  });

  describe('default transition name', () => {
    it('should use "v" as default name', async () => {
      const props: TransitionProps = {};

      performEnter(el, props);

      expect(el.classList.contains('v-enter-from')).toBe(true);
      expect(el.classList.contains('v-enter-active')).toBe(true);
    });
  });
});
