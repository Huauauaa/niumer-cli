#!/usr/bin/env node
import { printCliError, runCli } from './cli.js';

runCli(process.argv.slice(2)).catch((error: unknown) => {
  printCliError(error);
  process.exitCode = 1;
});
