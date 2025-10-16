import { Command } from 'commander';
import chalk from 'chalk';
import { createApp } from './commands/create.js';
import { dev } from './commands/dev.js';
import { build } from './commands/build.js';
import { preview } from './commands/preview.js';

const program = new Command();

program
  .name('quantum')
  .description('CLI tool for Quantum Framework')
  .version('0.0.1');

program
  .command('create [project-name]')
  .description('Create a new Quantum project')
  .option('-t, --template <template>', 'Project template (basic|typescript|full)', 'basic')
  .action(async (projectName, options) => {
    try {
      await createApp(projectName, options);
    } catch (error) {
      console.error(chalk.red('Error creating project:'), error);
      process.exit(1);
    }
  });

program
  .command('dev')
  .description('Start development server')
  .option('-p, --port <port>', 'Port number', '3000')
  .option('-h, --host <host>', 'Host address', 'localhost')
  .action(async (options) => {
    try {
      await dev(options);
    } catch (error) {
      console.error(chalk.red('Error starting dev server:'), error);
      process.exit(1);
    }
  });

program
  .command('build')
  .description('Build for production')
  .option('-o, --outDir <dir>', 'Output directory', 'dist')
  .option('--minify', 'Minify output', true)
  .action(async (options) => {
    try {
      await build(options);
    } catch (error) {
      console.error(chalk.red('Error building project:'), error);
      process.exit(1);
    }
  });

program
  .command('preview')
  .description('Preview production build')
  .option('-p, --port <port>', 'Port number', '4173')
  .option('-h, --host <host>', 'Host address', 'localhost')
  .action(async (options) => {
    try {
      await preview(options);
    } catch (error) {
      console.error(chalk.red('Error previewing build:'), error);
      process.exit(1);
    }
  });

program.parse();

export { createApp, dev, build, preview };
