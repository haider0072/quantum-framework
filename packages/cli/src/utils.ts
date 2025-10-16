import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs-extra';

/**
 * Get the directory name of the current module
 */
export function getCurrentDirname(importMetaUrl: string): string {
  return dirname(fileURLToPath(importMetaUrl));
}

/**
 * Check if a directory is empty
 */
export async function isEmptyDir(path: string): Promise<boolean> {
  try {
    const files = await fs.readdir(path);
    return files.length === 0;
  } catch {
    return true;
  }
}

/**
 * Copy directory recursively
 */
export async function copyDir(src: string, dest: string): Promise<void> {
  await fs.ensureDir(dest);
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copy(srcPath, destPath);
    }
  }
}

/**
 * Replace placeholders in file content
 */
export async function replaceInFile(
  filePath: string,
  replacements: Record<string, string>
): Promise<void> {
  let content = await fs.readFile(filePath, 'utf-8');

  for (const [key, value] of Object.entries(replacements)) {
    content = content.replace(new RegExp(key, 'g'), value);
  }

  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * Format package name
 */
export function formatPackageName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Validate project name
 */
export function validateProjectName(name: string): boolean {
  return /^[a-z0-9-]+$/.test(name) && !name.startsWith('-') && !name.endsWith('-');
}
