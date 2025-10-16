import { describe, it, expect } from 'vitest';
import { formatPackageName, validateProjectName } from './utils';

describe('utils', () => {
  describe('formatPackageName', () => {
    it('should convert to lowercase', () => {
      expect(formatPackageName('MyApp')).toBe('myapp');
    });

    it('should replace invalid characters with hyphens', () => {
      expect(formatPackageName('my app')).toBe('my-app');
      expect(formatPackageName('my@app')).toBe('my-app');
      expect(formatPackageName('my_app')).toBe('my-app');
    });

    it('should remove leading and trailing hyphens', () => {
      expect(formatPackageName('-myapp-')).toBe('myapp');
      expect(formatPackageName('--myapp--')).toBe('myapp');
    });

    it('should handle complex strings', () => {
      expect(formatPackageName('My Cool App!')).toBe('my-cool-app');
      expect(formatPackageName('  My App 123  ')).toBe('my-app-123');
    });
  });

  describe('validateProjectName', () => {
    it('should accept valid project names', () => {
      expect(validateProjectName('myapp')).toBe(true);
      expect(validateProjectName('my-app')).toBe(true);
      expect(validateProjectName('my-app-123')).toBe(true);
      expect(validateProjectName('app123')).toBe(true);
    });

    it('should reject invalid project names', () => {
      expect(validateProjectName('MyApp')).toBe(false);
      expect(validateProjectName('my_app')).toBe(false);
      expect(validateProjectName('my app')).toBe(false);
      expect(validateProjectName('my@app')).toBe(false);
      expect(validateProjectName('-myapp')).toBe(false);
      expect(validateProjectName('myapp-')).toBe(false);
      expect(validateProjectName('')).toBe(false);
    });
  });
});
