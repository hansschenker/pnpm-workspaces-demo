# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A pnpm workspaces monorepo demo: a counter app with a Hono API backend and a framework-free web frontend built on a custom TypeScript JSX runtime, sharing types through internal packages. Uses pnpm (version pinned via `packageManager` in root package.json). No React or other UI framework.

## Commands

```bash
pnpm install              # install all workspace dependencies
pnpm dev                  # run dev for all packages in parallel (tsc --watch for packages, tsx watch for hono, vite for web)
pnpm build                # build all packages recursively in topological order (pnpm -r run build)

pnpm --filter hono dev    # run only the API server (http://localhost:3000)
pnpm --filter web dev     # run only the web app (Vite dev server, http://localhost:5173)
```

There are no tests or linting in this repo.

## Architecture

Workspace layout (declared in `pnpm-workspace.yaml`: `apps/*`, `packages/*`):

- `packages/schema` (`@jilles/schema`) — Zod schemas and inferred types (`CounterSchema`, `Counter`). The shared contract between frontend and backend; no internal dependencies.
- `packages/database` (`@jilles/database`) — in-memory counter store (get/increment/decrement/reset/set). Depends on `@jilles/schema`.
- `packages/jsx` (`@jilles/jsx`) — custom JSX runtime that creates real DOM nodes (no virtual DOM, no React). Exports `./jsx-runtime` and `./jsx-dev-runtime` entry points so TypeScript/esbuild's automatic JSX transform (`jsxImportSource: "@jilles/jsx"`) compiles JSX into calls to its `jsx`/`jsxDEV` functions. Also exports `render`, `Fragment`, and the `JSX` type namespace (declared in `src/jsx-runtime.ts`). `createElement` maps props to DOM: `on*` functions become `addEventListener` (use lowercase, e.g. `onclick`), `style` objects are assigned to `element.style`, everything else becomes an attribute.
- `apps/hono` — Hono API server on port 3000 (`@hono/node-server`). Exposes `/counter` endpoints, validates request bodies with `CounterSchema.safeParse`. Depends on `@jilles/schema` and `@jilles/database`.
- `apps/web` — Vite frontend using `@jilles/jsx` for the UI. State is a module-level variable; updates re-render the whole app via `render(<App />, root)`. Calls the API at `http://localhost:3000`. Depends on `@jilles/schema` and `@jilles/jsx`.

Key mechanics:

- Internal packages are linked with `workspace:*` protocol in package.json dependencies.
- `packages/*` are consumed via their **built output** (`dist/` with `main`/`types`/`exports` pointing there), not source. After changing a package, it must be rebuilt (or have `tsc --watch` running via `pnpm dev`) before consumers pick up the change.
- TypeScript project references: root `tsconfig.json` references all five workspaces; packages use `composite: true` with declarations extending `tsconfig.base.json`. `apps/hono/tsconfig.json` is standalone (does not extend the base config).
- `apps/web` sets the JSX transform in both `tsconfig.json` (for type-checking) and `vite.config.ts` `esbuild` options (for the dev server/build) — keep them in sync.
- `pnpm-workspace.yaml` allowlists esbuild's install script via `onlyBuiltDependencies` (pnpm 10 blocks dependency build scripts by default).
