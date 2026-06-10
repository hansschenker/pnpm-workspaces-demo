# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A pnpm workspaces monorepo demo: a counter app with a Hono API backend and a React frontend sharing types through internal packages. Uses pnpm (version pinned via `packageManager` in root package.json).

## Commands

```bash
pnpm install              # install all workspace dependencies
pnpm dev                  # run dev for all packages in parallel (tsc --watch for packages, tsx watch for hono, vite for react)
pnpm build                # build all packages recursively (pnpm -r run build)

pnpm --filter hono dev    # run only the API server (http://localhost:3000)
pnpm --filter react dev   # run only the React app (Vite dev server)
pnpm --filter react lint  # ESLint is only configured in apps/react
```

There are no tests in this repo.

## Architecture

Workspace layout (declared in `pnpm-workspace.yaml`: `apps/*`, `packages/*`):

- `packages/schema` (`@jilles/schema`) — Zod schemas and inferred types (`CounterSchema`, `Counter`). The shared contract between frontend and backend; no internal dependencies.
- `packages/database` (`@jilles/database`) — in-memory counter store (get/increment/decrement/reset/set). Depends on `@jilles/schema`.
- `apps/hono` — Hono API server on port 3000 (`@hono/node-server`). Exposes `/counter` endpoints, validates request bodies with `CounterSchema.safeParse`. Depends on both packages.
- `apps/react` — Vite + React 19 frontend that calls the API at `http://localhost:3000`. Depends on `@jilles/schema` only.

Key mechanics:

- Internal packages are linked with `workspace:*` protocol in package.json dependencies.
- `packages/*` are consumed via their **built output** (`dist/` with `main`/`types`/`exports` pointing there), not source. After changing a package, it must be rebuilt (or have `tsc --watch` running via `pnpm dev`) before consumers pick up the change.
- TypeScript project references: root `tsconfig.json` references all four workspaces; packages use `composite: true` with declarations extending `tsconfig.base.json`. `apps/hono/tsconfig.json` is standalone (does not extend the base config).
