import { execa } from 'execa';
import chalk from 'chalk';
import fs from 'fs-extra';
import { join } from 'path';

interface PreviewOptions {
  port?: string;
  host?: string;
}

export async function preview(options: PreviewOptions): Promise<void> {
  const cwd = process.cwd();
  const distPath = join(cwd, 'dist');

  // Check if dist directory exists
  if (!(await fs.pathExists(distPath))) {
    console.error(
      chalk.red(
        '\n❌ Error: No dist directory found.\nRun "quantum build" first to create a production build.\n'
      )
    );
    process.exit(1);
  }

  console.log(chalk.bold.cyan('\n🔍 Starting preview server...\n'));

  // Build Vite command args
  const args = ['vite', 'preview'];
  if (options.port) {
    args.push('--port', options.port);
  }
  if (options.host) {
    args.push('--host', options.host);
  }

  try {
    // Run Vite preview server
    await execa('pnpm', args, {
      cwd,
      stdio: 'inherit',
    });
  } catch (error: any) {
    if (error.exitCode) {
      process.exit(error.exitCode);
    }
    throw error;
  }
}
