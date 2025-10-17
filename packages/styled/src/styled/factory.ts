/**
 * Styled component factory
 */

import type { StyledComponent, StyledProps, StyleInput } from '../types';
import { cssWithProps } from '../core/engine';

/**
 * Create a styled component from a base element
 */
export function createStyledComponent<P = any>(
  tag: string,
  baseStyles: StyleInput<P>
): StyledComponent<P> {
  const StyledComponent = ((props: P & StyledProps) => {
    const { as, className: externalClassName, ...restProps } = props;

    // Process styles with props
    const generatedClassName = cssWithProps(baseStyles, props as any);

    // Combine with external class names
    const finalClassName = externalClassName
      ? `${generatedClassName} ${externalClassName}`
      : generatedClassName;

    // Use the 'as' prop or the default tag
    const element = (as as string) || tag;

    return {
      type: element,
      props: {
        ...restProps,
        className: finalClassName,
      },
    };
  }) as StyledComponent<P>;

  // Set display name for debugging
  StyledComponent.displayName = `Styled(${tag})`;

  // Store the generated class name
  StyledComponent.className = '';

  return StyledComponent;
}

/**
 * Create a styled component with template literal syntax
 */
export function createStyledComponentFromTemplate<P = any>(
  tag: string,
  strings: TemplateStringsArray,
  interpolations: Array<StyleInput<P>>
): StyledComponent<P> {
  // Combine template strings with interpolations into a style function
  const styleFunction = (props: any): string => {
    let result = strings[0];

    for (let i = 0; i < interpolations.length; i++) {
      const interpolation = interpolations[i];

      // Handle function interpolations
      if (typeof interpolation === 'function') {
        result += String(interpolation(props));
      } else {
        result += String(interpolation);
      }

      result += strings[i + 1];
    }

    return result;
  };

  return createStyledComponent(tag, styleFunction);
}
