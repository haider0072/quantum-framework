import { execa } from 'execa';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import { join } from 'path';

interface BuildOptions {
  outDir?: string;
  minify?: boolean;
}

export async function build(options: BuildOptions): Promise<void> {
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

  console.log(chalk.bold.cyan('\n📦 Building for production...\n'));

  const spinner = ora('Building...').start();

  try {
    // Build Vite command args
    const args = ['vite', 'build'];
    if (options.outDir) {
      args.push('--outDir', options.outDir);
    }
    if (options.minify === false) {
      args.push('--minify', 'false');
    }

    // Run Vite build
    const result = await execa('pnpm', args, {
      cwd,
      stdio: 'pipe',
      env: {
        ...process.env,
        NODE_ENV: 'production',
      },
    });

    spinner.succeed(chalk.green('Build complete!'));

    // Show output
    if (result.stdout) {
      console.log(result.stdout);
    }

    // Show build directory
    const outDir = options.outDir || 'dist';
    console.log(chalk.dim(`\n📁 Output directory: ${outDir}\n`));
  } catch (error: any) {
    spinner.fail(chalk.red('Build failed'));

    if (error.stderr) {
      console.error(error.stderr);
    }
    if (error.stdout) {
      console.log(error.stdout);
    }

    process.exit(1);
  }
}
