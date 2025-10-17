/**
 * Styled components API
 */

import type { StyledFactory } from '../types';
import { createStyledComponent, createStyledComponentFromTemplate } from './factory';

/**
 * Create a styled component factory for a specific tag
 */
function createTaggedFactory(tag: string): StyledFactory {
  const factory: any = function (
    stylesOrStrings: any,
    ...interpolations: any[]
  ) {
    // Check if it's template literal syntax
    if (Array.isArray(stylesOrStrings) && 'raw' in stylesOrStrings) {
      return createStyledComponentFromTemplate(
        tag,
        stylesOrStrings as TemplateStringsArray,
        interpolations
      );
    }

    // Regular style input
    return createStyledComponent(tag, stylesOrStrings);
  };

  return factory;
}

/**
 * Styled object with factories for all HTML tags
 */
export const styled = {
  // Text content
  a: createTaggedFactory('a'),
  abbr: createTaggedFactory('abbr'),
  address: createTaggedFactory('address'),
  article: createTaggedFactory('article'),
  aside: createTaggedFactory('aside'),
  b: createTaggedFactory('b'),
  blockquote: createTaggedFactory('blockquote'),
  br: createTaggedFactory('br'),
  button: createTaggedFactory('button'),
  cite: createTaggedFactory('cite'),
  code: createTaggedFactory('code'),
  del: createTaggedFactory('del'),
  div: createTaggedFactory('div'),
  em: createTaggedFactory('em'),
  figcaption: createTaggedFactory('figcaption'),
  figure: createTaggedFactory('figure'),
  footer: createTaggedFactory('footer'),
  h1: createTaggedFactory('h1'),
  h2: createTaggedFactory('h2'),
  h3: createTaggedFactory('h3'),
  h4: createTaggedFactory('h4'),
  h5: createTaggedFactory('h5'),
  h6: createTaggedFactory('h6'),
  header: createTaggedFactory('header'),
  hr: createTaggedFactory('hr'),
  i: createTaggedFactory('i'),
  input: createTaggedFactory('input'),
  ins: createTaggedFactory('ins'),
  kbd: createTaggedFactory('kbd'),
  label: createTaggedFactory('label'),
  li: createTaggedFactory('li'),
  main: createTaggedFactory('main'),
  mark: createTaggedFactory('mark'),
  nav: createTaggedFactory('nav'),
  ol: createTaggedFactory('ol'),
  p: createTaggedFactory('p'),
  pre: createTaggedFactory('pre'),
  q: createTaggedFactory('q'),
  s: createTaggedFactory('s'),
  section: createTaggedFactory('section'),
  select: createTaggedFactory('select'),
  small: createTaggedFactory('small'),
  span: createTaggedFactory('span'),
  strong: createTaggedFactory('strong'),
  sub: createTaggedFactory('sub'),
  sup: createTaggedFactory('sup'),
  table: createTaggedFactory('table'),
  tbody: createTaggedFactory('tbody'),
  td: createTaggedFactory('td'),
  textarea: createTaggedFactory('textarea'),
  tfoot: createTaggedFactory('tfoot'),
  th: createTaggedFactory('th'),
  thead: createTaggedFactory('thead'),
  tr: createTaggedFactory('tr'),
  u: createTaggedFactory('u'),
  ul: createTaggedFactory('ul'),

  // Media
  audio: createTaggedFactory('audio'),
  canvas: createTaggedFactory('canvas'),
  img: createTaggedFactory('img'),
  video: createTaggedFactory('video'),

  // Forms
  form: createTaggedFactory('form'),
  option: createTaggedFactory('option'),
  optgroup: createTaggedFactory('optgroup'),
};
