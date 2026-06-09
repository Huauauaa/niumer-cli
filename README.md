# niumer-cli

Niumer CLI is a pnpm monorepo that contains:

- `packages/cli`: the `niumer` command.
- `docs`: VitePress documentation for CLI usage and features.

## Requirements

- Node.js 20 or later
- pnpm 10
- Git

## Install

```bash
npm i @harvey0379/niumer-cli -g
```

For local development:

```bash
pnpm install
```

## Develop

Run the CLI from source:

```bash
pnpm --filter @harvey0379/niumer-cli dev -- count
```

Build all packages:

```bash
pnpm build
```

Run tests:

```bash
pnpm test
```

Start the docs site:

```bash
pnpm docs:dev
```

## CLI usage

```bash
niumer count [options]
```

`niumer count` scans the current directory and its direct child directories for
Git repository roots. It then counts commits, changed files, inserted lines, and
deleted lines for the selected author and date range.

Defaults:

- `author`: `git config user.name`
- `timerange`: current year, from `01-01` to `12-31`
- `cwd`: current working directory

Examples:

```bash
niumer count
niumer count --timerange 2026-01-01..2026-06-30
niumer count --author "Jane Doe" --since 2026-01-01 --until 2026-12-31
niumer count --json
```

## Docs deployment

The GitHub Actions workflow in `.github/workflows/pages.yml` builds the
VitePress docs and deploys them to GitHub Pages.
