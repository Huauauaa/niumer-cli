import { countRepositories, formatCountReport, type CountOptions } from "./count.js";

interface ParsedArgs {
  help: boolean;
  json: boolean;
  options: CountOptions;
}

const helpText = `niumer

Usage:
  niumer count [options]

Options:
  --author <name>            Git author name or pattern. Defaults to git config user.name.
  --timerange <start..end>   Date range, for example 2026-01-01..2026-12-31.
  --since <date>             Start date. Overrides the timerange start.
  --until <date>             End date. Overrides the timerange end.
  --cwd <path>               Directory to scan. Defaults to the current directory.
  --json                     Print the report as JSON.
  -h, --help                 Show this help message.

Examples:
  niumer count
  niumer count --timerange 2026-01-01..2026-06-30
  niumer count --author "Jane Doe" --since 2026-01-01 --until 2026-03-31
`;

function readValue(args: string[], index: number, option: string): [string, number] {
  const next = args[index + 1];

  if (!next || next.startsWith("-")) {
    throw new Error(`Missing value for ${option}.`);
  }

  return [next, index + 1];
}

export function parseArgs(args: string[]): ParsedArgs {
  const [command, ...rest] = args;

  if (!command || command === "-h" || command === "--help") {
    return {
      help: true,
      json: false,
      options: {}
    };
  }

  if (command !== "count") {
    throw new Error(`Unknown command: ${command}`);
  }

  const options: CountOptions = {};
  let json = false;

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    const [option, inlineValue] = arg.split(/=(.*)/s, 2);
    let value = inlineValue;

    switch (option) {
      case "--author":
        if (value === undefined) {
          [value, index] = readValue(rest, index, option);
        }
        options.author = value;
        break;
      case "--cwd":
        if (value === undefined) {
          [value, index] = readValue(rest, index, option);
        }
        options.cwd = value;
        break;
      case "--since":
        if (value === undefined) {
          [value, index] = readValue(rest, index, option);
        }
        options.since = value;
        break;
      case "--timerange":
        if (value === undefined) {
          [value, index] = readValue(rest, index, option);
        }
        options.timerange = value;
        break;
      case "--until":
        if (value === undefined) {
          [value, index] = readValue(rest, index, option);
        }
        options.until = value;
        break;
      case "--json":
        json = true;
        break;
      case "-h":
      case "--help":
        return {
          help: true,
          json,
          options
        };
      default:
        throw new Error(`Unknown option: ${arg}`);
    }
  }

  return {
    help: false,
    json,
    options
  };
}

export async function runCli(args: string[]): Promise<void> {
  const parsed = parseArgs(args);

  if (parsed.help) {
    console.log(helpText);
    return;
  }

  const report = countRepositories(parsed.options);

  if (parsed.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(formatCountReport(report));
}

export function printCliError(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);

  console.error(`niumer: ${message}`);
  console.error("Run `niumer --help` for usage.");
}
