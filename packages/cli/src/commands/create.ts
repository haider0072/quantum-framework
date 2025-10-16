import { join, resolve } from 'path';
import fs from 'fs-extra';
import prompts from 'prompts';
import chalk from 'chalk';
import ora from 'ora';
import { execa } from 'execa';
import {
  copyDir,
  formatPackageName,
  validateProjectName,
  isEmptyDir,
  replaceInFile,
} from '../utils.js';

interface CreateOptions {
  template?: string;
}

const TEMPLATES = ['basic', 'typescript', 'full'];

export async function createApp(
  projectName: string | undefined,
  options: CreateOptions
): Promise<void> {
  console.log(chalk.bold.cyan('\n🚀 Create Quantum App\n'));

  // Prompt for project name if not provided
  if (!projectName) {
    const response = await prompts({
      type: 'text',
      name: 'projectName',
      message: 'Project name:',
      initial: 'quantum-app',
      validate: (value) =>
        validateProjectName(value) ? true : 'Invalid project name',
    });

    if (!response.projectName) {
      console.log(chalk.yellow('\n❌ Cancelled\n'));
      process.exit(0);
    }

    projectName = response.projectName;
  }

  // Validate project name
  if (!projectName || !validateProjectName(projectName)) {
    console.error(
      chalk.red(
        `\n❌ Invalid project name: "${projectName}"\nProject name must contain only lowercase letters, numbers, and hyphens.\n`
      )
    );
    process.exit(1);
  }

  const projectDir = resolve(process.cwd(), projectName);

  // Check if directory exists
  if (await fs.pathExists(projectDir)) {
    const isEmpty = await isEmptyDir(projectDir);
    if (!isEmpty) {
      const response = await prompts({
        type: 'confirm',
        name: 'overwrite',
        message: `Directory "${projectName}" already exists and is not empty. Overwrite?`,
        initial: false,
      });

      if (!response.overwrite) {
        console.log(chalk.yellow('\n❌ Cancelled\n'));
        process.exit(0);
      }

      await fs.emptyDir(projectDir);
    }
  }

  // Prompt for template if not provided
  let template = options.template || 'basic';
  if (!TEMPLATES.includes(template)) {
    const response = await prompts({
      type: 'select',
      name: 'template',
      message: 'Select a template:',
      choices: [
        { title: 'Basic', value: 'basic', description: 'Minimal setup' },
        {
          title: 'TypeScript',
          value: 'typescript',
          description: 'TypeScript configuration',
        },
        {
          title: 'Full',
          value: 'full',
          description: 'Full-featured with routing and state',
        },
      ],
      initial: 0,
    });

    if (!response.template) {
      console.log(chalk.yellow('\n❌ Cancelled\n'));
      process.exit(0);
    }

    template = response.template;
  }

  const spinner = ora('Creating project...').start();

  try {
    // Get template directory
    const templateDir = new URL(
      `../../templates/${template}`,
      import.meta.url
    ).pathname;

    // Copy template
    await copyDir(templateDir, projectDir);

    // Update package.json
    const packageJsonPath = join(projectDir, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.name = formatPackageName(projectName);
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

    spinner.succeed(chalk.green('Project created!'));

    // Install dependencies
    const installSpinner = ora('Installing dependencies...').start();

    try {
      await execa('pnpm', ['install'], {
        cwd: projectDir,
        stdio: 'pipe',
      });
      installSpinner.succeed(chalk.green('Dependencies installed!'));
    } catch (error) {
      installSpinner.warn(
        chalk.yellow('Failed to install dependencies automatically.')
      );
      console.log(chalk.dim('You can install them manually with: pnpm install'));
    }

    // Success message
    console.log(chalk.bold.green('\n✨ Done! Next steps:\n'));
    console.log(chalk.cyan(`  cd ${projectName}`));
    console.log(chalk.cyan('  pnpm dev'));
    console.log();
  } catch (error) {
    spinner.fail(chalk.red('Failed to create project'));
    throw error;
  }
}
