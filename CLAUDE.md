# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A reference fullstack TypeScript monorepo managed with pnpm workspaces: a counter app with a Hono API and a framework-free web client built on a custom TypeScript JSX runtime. No React or other UI framework. All workspace packages are scoped `@netxpert/*` and private.

## Commands

```bash
pnpm install                        # install all workspace dependencies
pnpm dev                            # build packages once, then run all dev tasks in parallel
pnpm build                          # build everything in topological order (pnpm -r run build)
pnpm clean                          # remove dist/ and tsbuildinfo in every workspace

pnpm --filter @netxpert/server dev  # run only the API server (http://localhost:3000)
pnpm --filter @netxpert/client dev  # run only the web client (Vite, http://localhost:5173)
pnpm --filter @netxpert/worker dev  # run the API on the local Workers runtime (http://localhost:8787)
pnpm --filter @netxpert/worker run deploy  # deploy the API to Workers ("run" is required: bare "deploy" is a pnpm built-in)
pnpm --filter @netxpert/client run deploy  # deploy the client to Pages (project netxpert-client)
```

There are no tests or linting in this repo.

## Architecture

Workspace layout (`pnpm-workspace.yaml`: `apps/*`, `packages/*`). The core idea: **`api` is a library, `server` is a deployable.**

- `packages/schema` (`@netxpert/schema`) — Zod schemas and inferred types (`CounterSchema`, `Counter`). The domain contract; no internal dependencies.
- `packages/database` (`@netxpert/database`) — defines the `CounterStore` interface (the storage port; methods may be sync or async, consumers must await) and `createMemoryStore()`. Depends on schema.
- `packages/api` (`@netxpert/api`) — Hono route definitions and handlers, exported as a factory `createApi(resolveStore)` plus the app type (`AppType`). The store is resolved per request from the runtime's env, so each deployable injects its own `CounterStore`. **Runtime-agnostic: it must never import a runtime adapter** (`@hono/node-server`, Workers types, etc.). Routes are **method-chained** on one expression — required so `AppType` captures the full route tree for RPC typing. Depends on schema and database.
- `packages/jsx` (`@netxpert/jsx`) — custom JSX runtime creating real DOM nodes (no virtual DOM). Exports `./jsx-runtime` and `./jsx-dev-runtime` so the automatic JSX transform (`jsxImportSource: "@netxpert/jsx"`) compiles JSX into its `jsx`/`jsxDEV` calls. Also exports `render`, `Fragment`, and the `JSX` type namespace (in `src/jsx-runtime.ts`). Prop mapping: `on*` functions → `addEventListener` (lowercase, e.g. `onclick`), `style` objects → `element.style`, everything else → attributes.
- `apps/server` (`@netxpert/server`) — thin Node bootstrap: `createApi(() => createMemoryStore())` served via `@hono/node-server` on port 3000. State lives for the process lifetime.
- `apps/worker` (`@netxpert/worker`) — the same api on Cloudflare Workers, backed by the `CounterObject` Durable Object (SQLite storage, RPC methods, one named instance via `getByName('counter')`). The DO class must be exported from the worker entrypoint and is wired in `wrangler.jsonc` (`durable_objects.bindings` + `migrations.new_sqlite_classes`). Its build runs `wrangler types` to generate `worker-configuration.d.ts` (gitignored — regenerate after changing `wrangler.jsonc`, e.g. when adding bindings).
- `apps/client` (`@netxpert/client`) — Vite app using `@netxpert/jsx` for the UI and Hono's typed RPC client (`hc<AppType>`) instead of hand-written fetch calls, so routes/methods/response shapes are compile-time checked against the api package. State is a module-level variable; updates re-render the whole app via `render(<App />, root)`.

## Key mechanics

- Internal packages are linked with `workspace:*`; shared third-party versions live in the **catalog** in `pnpm-workspace.yaml` and are referenced as `"catalog:"` in package.jsons. Bump versions there, not in individual packages.
- `packages/*` are consumed via built `dist/` output (`exports` points there), not source. After changing a package it must be rebuilt before consumers see the change; root `pnpm dev` builds packages first and then runs `tsc -b --watch` in each, so this is automatic during development.
- TypeScript project references mirror the dependency graph: each tsconfig `references` its workspace deps, all extend `tsconfig.base.json`, builds use `tsc -b`. `apps/server` overrides module/moduleResolution to NodeNext (it emits for Node); everything else uses the base bundler resolution.
- In local dev there is no CORS: the client uses relative URLs and the Vite dev server proxies `/counter` to `http://localhost:3000` (see `apps/client/vite.config.ts`). If you add API route prefixes, extend the proxy config. In production the client (Pages, https://netxpert-client.pages.dev) calls the worker API cross-origin: `apps/client/.env.production` sets `VITE_API_URL`, and the worker wraps the api with CORS allowing only the Pages production and preview origins (`apps/worker/src/index.ts`).
- `apps/client` sets the JSX transform in both `tsconfig.json` (type-checking) and `vite.config.ts` `esbuild` options (dev server/build) — keep them in sync.
- `pnpm-workspace.yaml` allowlists esbuild's install script via `onlyBuiltDependencies` (pnpm 10 blocks dependency build scripts by default).
