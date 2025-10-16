import { execa } from 'execa';
import chalk from 'chalk';
import fs from 'fs-extra';
import { join } from 'path';

interface DevOptions {
  port?: string;
  host?: string;
}

export async function dev(options: DevOptions): Promise<void> {
  const cwd = process.cwd();
  const packageJsonPath = join(cwd, 'package.json');

  // Check if package.json exists
  if (!(await fs.pathExists(packageJsonPath))) {
    console.error(
      chalk.red(
        '\n❌ Error: No package.json found in current directory.\nMake sure you are in a Quantum project directory.\n'
      )
    );
    process.exit(1);
  }

  // Check if this is a Quantum project
  try {
    const packageJson = await fs.readJson(packageJsonPath);
    const hasQuantumDep =
      packageJson.dependencies?.['@quantum/core'] ||
      packageJson.devDependencies?.['@quantum/core'];

    if (!hasQuantumDep) {
      console.warn(
        chalk.yellow(
          '\n⚠️  Warning: This doesn\'t appear to be a Quantum project.\n'
        )
      );
    }
  } catch (error) {
    console.error(chalk.red('\n❌ Error reading package.json\n'));
    process.exit(1);
  }

  console.log(chalk.bold.cyan('\n🚀 Starting development server...\n'));

  // Build Vite command args
  const args = ['vite'];
  if (options.port) {
    args.push('--port', options.port);
  }
  if (options.host) {
    args.push('--host', options.host);
  }

  try {
    // Run Vite dev server
    await execa('pnpm', args, {
      cwd,
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'development',
      },
    });
  } catch (error: any) {
    if (error.exitCode) {
      process.exit(error.exitCode);
    }
    throw error;
  }
}
