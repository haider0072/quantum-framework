#!/usr/bin/env node
import { createApp } from '../dist/index.js';

// Run create command with project name from args
const projectName = process.argv[2];
const template = process.argv.includes('--template')
  ? process.argv[process.argv.indexOf('--template') + 1]
  : 'basic';

createApp(projectName, { template }).catch((error) => {
  console.error(error);
  process.exit(1);
});
