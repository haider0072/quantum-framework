/**
 * Code Transformer for Quantum Framework
 *
 * Transforms JSX/TSX AST to optimize for Quantum's reactivity system:
 * - Converts JSX to framework calls (jsx/jsxs/jsxDEV)
 * - Extracts static content for caching
 * - Identifies reactive dependencies
 * - Optimizes component updates
 */

import traverse, { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import type { File } from '@babel/types';

export interface TransformOptions {
  development?: boolean;
  sourceMaps?: boolean;
  filename?: string;
}

export interface TransformResult {
  ast: File;
  metadata: TransformMetadata;
}

export interface TransformMetadata {
  hasJSX: boolean;
  staticNodes: number;
  dynamicNodes: number;
  components: string[];
  signals: string[];
}

/**
 * Transform JSX/TSX AST with Quantum-specific optimizations
 */
export function transformAST(ast: File, options: TransformOptions = {}): TransformResult {
  const { development = false } = options;

  const metadata: TransformMetadata = {
    hasJSX: false,
    staticNodes: 0,
    dynamicNodes: 0,
    components: [],
    signals: [],
  };

  // Track imports to determine what needs to be added
  const imports = {
    hasJSXImport: false,
    hasSignalImport: false,
  };

  traverse(ast, {
    // Transform JSX Elements
    JSXElement(path) {
      metadata.hasJSX = true;
      transformJSXElement(path, development, metadata);
    },

    // Transform JSX Fragments
    JSXFragment(path) {
      metadata.hasJSX = true;
      transformJSXFragment(path, development);
    },

    // Track component declarations
    FunctionDeclaration(path) {
      const name = path.node.id?.name;
      if (name && /^[A-Z]/.test(name)) {
        metadata.components.push(name);
      }
    },

    // Track variable declarations that might be components
    VariableDeclarator(path) {
      if (
        t.isIdentifier(path.node.id) &&
        /^[A-Z]/.test(path.node.id.name) &&
        (t.isFunctionExpression(path.node.init) || t.isArrowFunctionExpression(path.node.init))
      ) {
        metadata.components.push(path.node.id.name);
      }
    },

    // Track signal usage
    CallExpression(path) {
      if (t.isIdentifier(path.node.callee) && path.node.callee.name === 'signal') {
        metadata.signals.push('signal');
      }
    },

    // Check for JSX import
    ImportDeclaration(path) {
      const source = path.node.source.value;
      if (source.includes('jsx-runtime') || source.includes('jsx-dev-runtime')) {
        imports.hasJSXImport = true;
      }
      if (source.includes('@quantum/reactivity')) {
        imports.hasSignalImport = true;
      }
    },
  });

  // Add JSX import if needed and not present
  if (metadata.hasJSX && !imports.hasJSXImport) {
    addJSXImport(ast, development);
  }

  return {
    ast,
    metadata,
  };
}

/**
 * Transform a JSX element to framework calls
 */
function transformJSXElement(
  path: NodePath<t.JSXElement>,
  development: boolean,
  metadata: TransformMetadata
) {
  const openingElement = path.node.openingElement;
  const tagName = getTagName(openingElement.name);
  const props = getProps(openingElement.attributes);
  const children = getChildren(path.node.children);

  // Check if this is a static node (no dynamic content)
  const isStatic = isStaticElement(openingElement, path.node.children);
  if (isStatic) {
    metadata.staticNodes++;
  } else {
    metadata.dynamicNodes++;
  }

  // Create the jsx() or jsxs() call
  const jsxFunction = development ? 'jsxDEV' : children.length > 1 ? 'jsxs' : 'jsx';

  const args: t.Expression[] = [
    t.isJSXIdentifier(openingElement.name) && /^[a-z]/.test(tagName)
      ? t.stringLiteral(tagName) // HTML element
      : t.identifier(tagName), // Component
    props,
  ];

  if (children.length > 0) {
    args.push(children.length === 1 ? children[0] : t.arrayExpression(children));
  }

  if (development) {
    // Add source location for dev mode
    args.push(
      t.objectExpression([
        t.objectProperty(t.identifier('fileName'), t.stringLiteral('unknown')),
        t.objectProperty(t.identifier('lineNumber'), t.numericLiteral(path.node.loc?.start.line || 0)),
      ])
    );
  }

  path.replaceWith(t.callExpression(t.identifier(jsxFunction), args));
}

/**
 * Transform a JSX fragment to framework calls
 */
function transformJSXFragment(path: NodePath<t.JSXFragment>, development: boolean) {
  const children = getChildren(path.node.children);

  const jsxFunction = development ? 'jsxDEV' : children.length > 1 ? 'jsxs' : 'jsx';
  const args: t.Expression[] = [
    t.identifier('Fragment'),
    t.objectExpression([]),
  ];

  if (children.length > 0) {
    args.push(children.length === 1 ? children[0] : t.arrayExpression(children));
  }

  path.replaceWith(t.callExpression(t.identifier(jsxFunction), args));
}

/**
 * Get tag name from JSX element name
 */
function getTagName(name: t.JSXIdentifier | t.JSXMemberExpression | t.JSXNamespacedName): string {
  if (t.isJSXIdentifier(name)) {
    return name.name;
  }
  if (t.isJSXMemberExpression(name)) {
    return `${getTagName(name.object as any)}.${name.property.name}`;
  }
  return `${name.namespace.name}:${name.name.name}`;
}

/**
 * Convert JSX attributes to props object
 */
function getProps(attributes: Array<t.JSXAttribute | t.JSXSpreadAttribute>): t.ObjectExpression {
  const properties: Array<t.ObjectProperty | t.SpreadElement> = [];

  for (const attr of attributes) {
    if (t.isJSXSpreadAttribute(attr)) {
      properties.push(t.spreadElement(attr.argument));
    } else if (t.isJSXAttribute(attr)) {
      const key = t.isJSXIdentifier(attr.name)
        ? t.identifier(attr.name.name)
        : t.stringLiteral(`${attr.name.namespace.name}:${attr.name.name.name}`);

      let value: t.Expression;
      if (attr.value === null) {
        value = t.booleanLiteral(true);
      } else if (t.isStringLiteral(attr.value)) {
        value = attr.value;
      } else if (t.isJSXExpressionContainer(attr.value)) {
        value = attr.value.expression as t.Expression;
      } else if (t.isJSXElement(attr.value) || t.isJSXFragment(attr.value)) {
        value = attr.value as any;
      } else {
        value = t.nullLiteral();
      }

      properties.push(t.objectProperty(key, value));
    }
  }

  return t.objectExpression(properties);
}

/**
 * Convert JSX children to array of expressions
 */
function getChildren(children: Array<t.JSXText | t.JSXExpressionContainer | t.JSXSpreadChild | t.JSXElement | t.JSXFragment>): t.Expression[] {
  const result: t.Expression[] = [];

  for (const child of children) {
    if (t.isJSXText(child)) {
      const text = child.value.replace(/\s+/g, ' ').trim();
      if (text) {
        result.push(t.stringLiteral(text));
      }
    } else if (t.isJSXExpressionContainer(child)) {
      if (!t.isJSXEmptyExpression(child.expression)) {
        result.push(child.expression as t.Expression);
      }
    } else if (t.isJSXElement(child) || t.isJSXFragment(child)) {
      result.push(child as any);
    }
  }

  return result;
}

/**
 * Check if an element is static (no dynamic content)
 */
function isStaticElement(
  openingElement: t.JSXOpeningElement,
  children: Array<t.JSXText | t.JSXExpressionContainer | t.JSXSpreadChild | t.JSXElement | t.JSXFragment>
): boolean {
  // Check for dynamic attributes
  for (const attr of openingElement.attributes) {
    if (t.isJSXSpreadAttribute(attr)) {
      return false;
    }
    if (t.isJSXAttribute(attr) && attr.value && t.isJSXExpressionContainer(attr.value)) {
      return false;
    }
  }

  // Check for dynamic children
  for (const child of children) {
    if (t.isJSXExpressionContainer(child)) {
      return false;
    }
    if (t.isJSXElement(child)) {
      return false; // Conservatively mark as dynamic if it has child elements
    }
  }

  return true;
}

/**
 * Add JSX import to the AST
 */
function addJSXImport(ast: File, development: boolean) {
  const importSource = development
    ? '@quantum/component/jsx-dev-runtime'
    : '@quantum/component/jsx-runtime';

  const specifiers = development
    ? [t.importSpecifier(t.identifier('jsxDEV'), t.identifier('jsxDEV'))]
    : [
        t.importSpecifier(t.identifier('jsx'), t.identifier('jsx')),
        t.importSpecifier(t.identifier('jsxs'), t.identifier('jsxs')),
      ];

  specifiers.push(t.importSpecifier(t.identifier('Fragment'), t.identifier('Fragment')));

  const importDeclaration = t.importDeclaration(specifiers, t.stringLiteral(importSource));

  ast.program.body.unshift(importDeclaration);
}
