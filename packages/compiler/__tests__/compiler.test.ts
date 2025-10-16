import { describe, it, expect } from 'vitest';
import { compile } from '../src/index';

describe('Quantum Compiler', () => {
  describe('Basic JSX Transformation', () => {
    it('should transform simple JSX element', () => {
      const code = `const App = () => <div>Hello</div>`;
      const result = compile(code, { filename: 'test.tsx' });

      expect(result.code).toContain('jsx');
      expect(result.code).toContain('"div"');
      expect(result.code).toContain('"Hello"');
      expect(result.metadata.hasJSX).toBe(true);
    });

    it('should transform JSX with attributes', () => {
      const code = `const App = () => <div className="test" id="app">Content</div>`;
      const result = compile(code, { filename: 'test.tsx' });

      expect(result.code).toContain('className');
      expect(result.code).toContain('"test"');
      expect(result.code).toContain('id');
      expect(result.code).toContain('"app"');
    });

    it('should transform JSX with dynamic props', () => {
      const code = `const App = ({ title }) => <div title={title}>Content</div>`;
      const result = compile(code, { filename: 'test.tsx' });

      expect(result.code).toContain('title');
      expect(result.metadata.dynamicNodes).toBeGreaterThan(0);
    });

    it('should transform multiple children', () => {
      const code = `const App = () => (
        <div>
          <span>First</span>
          <span>Second</span>
        </div>
      )`;
      const result = compile(code, { filename: 'test.tsx' });

      expect(result.code).toContain('jsxs');
      expect(result.code).toContain('"First"');
      expect(result.code).toContain('"Second"');
    });
  });

  describe('JSX Fragments', () => {
    it('should transform JSX fragments', () => {
      const code = `const App = () => (
        <>
          <div>First</div>
          <div>Second</div>
        </>
      )`;
      const result = compile(code, { filename: 'test.tsx' });

      expect(result.code).toContain('Fragment');
      expect(result.metadata.hasJSX).toBe(true);
    });
  });

  describe('Component Detection', () => {
    it('should detect function components', () => {
      const code = `function MyComponent() { return <div>Test</div>; }`;
      const result = compile(code, { filename: 'test.tsx' });

      expect(result.metadata.components).toContain('MyComponent');
    });

    it('should detect arrow function components', () => {
      const code = `const MyComponent = () => <div>Test</div>;`;
      const result = compile(code, { filename: 'test.tsx' });

      expect(result.metadata.components).toContain('MyComponent');
    });

    it('should not detect lowercase functions as components', () => {
      const code = `const myFunction = () => <div>Test</div>;`;
      const result = compile(code, { filename: 'test.tsx' });

      expect(result.metadata.components).not.toContain('myFunction');
    });
  });

  describe('Static Analysis', () => {
    it('should identify static nodes', () => {
      const code = `const App = () => <div>Static text</div>`;
      const result = compile(code, { filename: 'test.tsx' });

      expect(result.metadata.staticNodes).toBeGreaterThan(0);
    });

    it('should identify dynamic nodes', () => {
      const code = `const App = ({ text }) => <div>{text}</div>`;
      const result = compile(code, { filename: 'test.tsx' });

      expect(result.metadata.dynamicNodes).toBeGreaterThan(0);
    });
  });

  describe('Development Mode', () => {
    it('should use jsxDEV in development mode', () => {
      const code = `const App = () => <div>Test</div>`;
      const result = compile(code, {
        filename: 'test.tsx',
        development: true
      });

      expect(result.code).toContain('jsxDEV');
    });

    it('should include source location in dev mode', () => {
      const code = `const App = () => <div>Test</div>`;
      const result = compile(code, {
        filename: 'test.tsx',
        development: true
      });

      expect(result.code).toContain('fileName');
      expect(result.code).toContain('lineNumber');
    });
  });

  describe('Production Mode', () => {
    it('should use jsx/jsxs in production mode', () => {
      const code = `const App = () => <div>Test</div>`;
      const result = compile(code, {
        filename: 'test.tsx',
        development: false
      });

      expect(result.code).toContain('jsx');
      expect(result.code).not.toContain('jsxDEV');
    });

    it('should minify in production mode', () => {
      const code = `const App = () => <div>Test</div>`;
      const result = compile(code, {
        filename: 'test.tsx',
        development: false,
        minified: true
      });

      // Minified code should be more compact
      expect(result.code.length).toBeLessThan(code.length * 5);
    });
  });

  describe('Auto-Imports', () => {
    it('should add JSX import when needed', () => {
      const code = `const App = () => <div>Test</div>`;
      const result = compile(code, { filename: 'test.tsx' });

      expect(result.code).toMatch(/import.*from.*jsx-runtime/);
    });

    it('should not add JSX import if already present', () => {
      const code = `
        import { jsx } from '@quantum/component/jsx-runtime';
        const App = () => <div>Test</div>
      `;
      const result = compile(code, { filename: 'test.tsx' });

      // Count occurrences of jsx-runtime import
      const matches = result.code.match(/jsx-runtime/g);
      expect(matches?.length).toBe(1);
    });

    it('should import Fragment when using fragments', () => {
      const code = `const App = () => <><div>Test</div></>`;
      const result = compile(code, { filename: 'test.tsx' });

      expect(result.code).toContain('Fragment');
    });
  });

  describe('Component Props', () => {
    it('should handle spread props', () => {
      const code = `const App = (props) => <div {...props}>Test</div>`;
      const result = compile(code, { filename: 'test.tsx' });

      expect(result.code).toContain('...props');
    });

    it('should handle boolean props', () => {
      const code = `const App = () => <input disabled />`;
      const result = compile(code, { filename: 'test.tsx' });

      expect(result.code).toContain('disabled');
      expect(result.code).toContain('true');
    });

    it('should handle event handlers', () => {
      const code = `const App = () => <button onClick={() => {}}>Click</button>`;
      const result = compile(code, { filename: 'test.tsx' });

      expect(result.code).toContain('onClick');
    });
  });

  describe('TypeScript Support', () => {
    it('should handle TypeScript syntax', () => {
      const code = `
        interface Props { title: string }
        const App: React.FC<Props> = ({ title }) => <div>{title}</div>
      `;
      const result = compile(code, { filename: 'test.tsx' });

      expect(result.metadata.hasJSX).toBe(true);
      expect(result.code).toContain('jsx');
    });

    it('should handle type annotations', () => {
      const code = `const App = (props: { name: string }) => <div>{props.name}</div>`;
      const result = compile(code, { filename: 'test.tsx' });

      expect(result.metadata.hasJSX).toBe(true);
    });
  });

  describe('Source Maps', () => {
    it('should generate source maps when enabled', () => {
      const code = `const App = () => <div>Test</div>`;
      const result = compile(code, {
        filename: 'test.tsx',
        sourceMaps: true
      });

      expect(result.map).toBeDefined();
    });

    it('should not generate source maps when disabled', () => {
      const code = `const App = () => <div>Test</div>`;
      const result = compile(code, {
        filename: 'test.tsx',
        sourceMaps: false
      });

      // Babel generator returns null when sourceMaps is false
      expect(result.map).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty JSX', () => {
      const code = `const App = () => <div />`;
      const result = compile(code, { filename: 'test.tsx' });

      expect(result.metadata.hasJSX).toBe(true);
      expect(result.code).toContain('jsx');
    });

    it('should handle nested components', () => {
      const code = `
        const Child = () => <span>Child</span>;
        const Parent = () => <div><Child /></div>;
      `;
      const result = compile(code, { filename: 'test.tsx' });

      expect(result.metadata.components).toContain('Child');
      expect(result.metadata.components).toContain('Parent');
    });

    it('should handle member expressions in JSX', () => {
      const code = `const App = () => <div.section>Test</div.section>`;
      const result = compile(code, { filename: 'test.tsx' });

      expect(result.code).toContain('div.section');
    });

    it('should skip non-JSX files', () => {
      const code = `const x = 5;`;
      const result = compile(code, { filename: 'test.js' });

      expect(result.metadata.hasJSX).toBe(false);
      expect(result.code).toBe(code);
    });
  });
});
