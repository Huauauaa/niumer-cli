import { readdirSync, realpathSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

export interface DateRange {
  since: string;
  until: string;
}

export interface CountOptions {
  author?: string;
  cwd?: string;
  since?: string;
  timerange?: string;
  until?: string;
}

export interface RepositoryInfo {
  name: string;
  path: string;
}

export interface RepositoryCount extends RepositoryInfo {
  commits: number;
  deletions: number;
  filesChanged: number;
  insertions: number;
  totalChanged: number;
}

export interface CountReport {
  author: string;
  range: DateRange;
  repositories: RepositoryCount[];
}

interface GitResult {
  status: number | null;
  stderr: string;
  stdout: string;
}

function runGit(args: string[], cwd: string): GitResult {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    windowsHide: true
  });

  if (result.error) {
    throw result.error;
  }

  return {
    status: result.status,
    stderr: result.stderr.trim(),
    stdout: result.stdout.trim()
  };
}

function runGitOrThrow(args: string[], cwd: string): string {
  const result = runGit(args, cwd);

  if (result.status !== 0) {
    const command = `git ${args.join(" ")}`;
    throw new Error(result.stderr || `Command failed: ${command}`);
  }

  return result.stdout;
}

export function getDefaultDateRange(now = new Date()): DateRange {
  const year = now.getFullYear();

  return {
    since: `${year}-01-01`,
    until: `${year}-12-31`
  };
}

export function parseTimerange(timerange: string): DateRange {
  const parts = timerange.split(/\.\.|,|:/).map((part) => part.trim());

  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error(
      "Invalid timerange. Use start..end, for example 2026-01-01..2026-12-31."
    );
  }

  return {
    since: parts[0],
    until: parts[1]
  };
}

export function resolveDateRange(options: CountOptions, now = new Date()): DateRange {
  const timerange = options.timerange
    ? parseTimerange(options.timerange)
    : getDefaultDateRange(now);

  return {
    since: options.since ?? timerange.since,
    until: options.until ?? timerange.until
  };
}

export function resolveAuthor(author: string | undefined, cwd: string): string {
  if (author?.trim()) {
    return author.trim();
  }

  const result = runGit(["config", "--get", "user.name"], cwd);

  if (result.status === 0 && result.stdout) {
    return result.stdout;
  }

  throw new Error(
    "Missing author. Pass --author or configure git user.name for this environment."
  );
}

function getRepositoryRoot(candidate: string): string | null {
  const result = runGit(["rev-parse", "--show-toplevel"], candidate);

  if (result.status !== 0 || !result.stdout) {
    return null;
  }

  return realpathSync(result.stdout);
}

export function discoverRepositories(cwd: string): RepositoryInfo[] {
  const root = realpathSync(cwd);
  const candidates = [
    root,
    ...readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name !== "node_modules")
      .map((entry) => path.join(root, entry.name))
  ];
  const repositories = new Map<string, RepositoryInfo>();

  for (const candidate of candidates) {
    const realCandidate = realpathSync(candidate);
    const repositoryRoot = getRepositoryRoot(realCandidate);

    if (repositoryRoot !== realCandidate) {
      continue;
    }

    repositories.set(repositoryRoot, {
      name: path.basename(repositoryRoot),
      path: repositoryRoot
    });
  }

  return [...repositories.values()].sort((left, right) =>
    left.name.localeCompare(right.name)
  );
}

export function summarizeNumstat(output: string): Pick<
  RepositoryCount,
  "deletions" | "filesChanged" | "insertions" | "totalChanged"
> {
  let deletions = 0;
  let filesChanged = 0;
  let insertions = 0;

  for (const line of output.split(/\r?\n/)) {
    if (!line.trim()) {
      continue;
    }

    const [added, deleted] = line.split("\t");
    filesChanged += 1;

    if (added !== "-") {
      insertions += Number.parseInt(added, 10);
    }

    if (deleted !== "-") {
      deletions += Number.parseInt(deleted, 10);
    }
  }

  return {
    deletions,
    filesChanged,
    insertions,
    totalChanged: insertions + deletions
  };
}

function countRepository(
  repository: RepositoryInfo,
  author: string,
  range: DateRange
): RepositoryCount {
  const commonArgs = [
    `--author=${author}`,
    `--since=${range.since}`,
    `--until=${range.until}`
  ];
  const commits = Number.parseInt(
    runGitOrThrow(["rev-list", "--count", ...commonArgs, "HEAD"], repository.path),
    10
  );
  const numstat = runGitOrThrow(
    ["log", "HEAD", ...commonArgs, "--pretty=format:", "--numstat"],
    repository.path
  );
  const summary = summarizeNumstat(numstat);

  return {
    ...repository,
    commits,
    ...summary
  };
}

export function countRepositories(options: CountOptions = {}): CountReport {
  const cwd = realpathSync(options.cwd ?? process.cwd());
  const author = resolveAuthor(options.author, cwd);
  const range = resolveDateRange(options);
  const repositories = discoverRepositories(cwd).map((repository) =>
    countRepository(repository, author, range)
  );

  return {
    author,
    range,
    repositories
  };
}

function pad(value: string | number, width: number): string {
  return String(value).padEnd(width, " ");
}

export function formatCountReport(report: CountReport): string {
  if (report.repositories.length === 0) {
    return [
      `Author: ${report.author}`,
      `Range: ${report.range.since}..${report.range.until}`,
      "No Git repositories found in the current directory."
    ].join("\n");
  }

  const rows = report.repositories.map((repository) => [
    repository.name,
    repository.commits,
    repository.filesChanged,
    repository.insertions,
    repository.deletions,
    repository.totalChanged
  ]);
  const headers = ["Repository", "Commits", "Files", "Inserted", "Deleted", "Total"];
  const widths = headers.map((header, index) =>
    Math.max(
      header.length,
      ...rows.map((row) => String(row[index]).length)
    )
  );
  const table = [
    headers.map((header, index) => pad(header, widths[index])).join("  "),
    widths.map((width) => "-".repeat(width)).join("  "),
    ...rows.map((row) =>
      row.map((cell, index) => pad(cell, widths[index])).join("  ")
    )
  ];
  const totals = report.repositories.reduce(
    (total, repository) => ({
      commits: total.commits + repository.commits,
      deletions: total.deletions + repository.deletions,
      filesChanged: total.filesChanged + repository.filesChanged,
      insertions: total.insertions + repository.insertions,
      totalChanged: total.totalChanged + repository.totalChanged
    }),
    {
      commits: 0,
      deletions: 0,
      filesChanged: 0,
      insertions: 0,
      totalChanged: 0
    }
  );

  return [
    `Author: ${report.author}`,
    `Range: ${report.range.since}..${report.range.until}`,
    "",
    ...table,
    "",
    `Total commits: ${totals.commits}`,
    `Total files changed: ${totals.filesChanged}`,
    `Total lines changed: ${totals.totalChanged} (+${totals.insertions} / -${totals.deletions})`
  ].join("\n");
}
