# netxpert-fullstack

A reference fullstack TypeScript monorepo managed with **pnpm workspaces** — no UI framework, no ORM, no magic. A small counter app demonstrates how the pieces connect.

## Layout

```
apps/
  client      @netxpert/client    Vite web app — custom JSX runtime + typed RPC client
  server      @netxpert/server    Node bootstrap that serves the api package on :3000
packages/
  api         @netxpert/api       Hono routes as a runtime-agnostic library
  schema      @netxpert/schema    Zod schemas — the contract shared by client and server
  database    @netxpert/database  In-memory data store
  jsx         @netxpert/jsx       Custom JSX runtime (TypeScript JSX → real DOM nodes)
```

The guiding rule: **`api` is a library, `server` is a deployable.** The api package exports a composed Hono app (`api`) and its type (`AppType`) but never imports a runtime adapter. `apps/server` binds it to Node with `@hono/node-server`; a Cloudflare Worker would be a sibling app exporting `{ fetch: api.fetch }` — same routes, zero changes.

## Getting started

```bash
pnpm install
pnpm dev        # builds packages once, then runs everything in watch mode
```

- Web app: http://localhost:5173 (Vite proxies `/counter` to the API — no CORS needed)
- API: http://localhost:3000 (`GET /` lists the endpoints)

Other commands:

```bash
pnpm build                          # build all workspaces in dependency order
pnpm clean                          # remove all build output
pnpm --filter @netxpert/server dev  # run a single workspace
```

## What it demonstrates

**pnpm workspaces.** Internal packages are linked with the `workspace:*` protocol. Shared third-party versions (typescript, zod, hono, vite, …) are declared once in the [catalog](https://pnpm.io/catalogs) in `pnpm-workspace.yaml` and referenced as `"catalog:"` — one place to bump versions for the whole repo.

**End-to-end type safety.** `packages/schema` holds the Zod domain models. `packages/api` chains its Hono routes so the full route tree is captured in `AppType`, and the client calls the API through Hono's RPC client:

```ts
const client = hc<AppType>(window.location.origin);
const res = await client.counter.increment.$post();  // typed: path, method, response
const counter: Counter = await res.json();
```

Rename a route or change a response shape and the client fails to compile.

**A JSX runtime without React.** `packages/jsx` implements the automatic JSX transform contract (`jsx-runtime` / `jsx-dev-runtime` exports). Setting `jsxImportSource: "@netxpert/jsx"` makes TypeScript and esbuild compile JSX into calls to its `jsx()` function, which creates real DOM nodes directly — `on*` props become event listeners, `style` objects are assigned to `element.style`. No virtual DOM; the client re-renders by replacing the root's children.

**TypeScript project references.** Every tsconfig extends `tsconfig.base.json` and `references` its workspace dependencies; builds use `tsc -b`. Packages are consumed through their built `dist/` (declaration maps included, so go-to-definition lands in source).
