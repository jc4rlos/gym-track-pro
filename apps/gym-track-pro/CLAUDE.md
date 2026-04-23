# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Dev server at localhost:3000
pnpm build        # tsc -b && vite build
pnpm lint         # eslint .
pnpm format       # prettier format
pnpm format:check # prettier check (no write)
pnpm preview      # preview production build
```

No test runner configured.

## Architecture

Personal finance SPA ("Chanchi"). React 19 + TypeScript strict + Vite + TanStack Router + React Query + Zustand + Supabase.

### Routing

TanStack Router with **file-based routing** — `src/routes/` maps to URLs. Never hand-write routes; add files and the router plugin auto-generates `routeTree.gen.ts`.

- `__root.tsx` — root layout, initializes Supabase auth listener
- `_app.tsx` — auth guard; redirects unauthenticated users to `/login`
- `_app/*.tsx` — protected feature pages

### State management — two layers

| Layer              | Tool        | Location                                  |
| ------------------ | ----------- | ----------------------------------------- |
| Server/async state | React Query | hooks inside `src/features/*/`            |
| UI + auth state    | Zustand     | `src/stores/auth-store.ts`, `ui-store.ts` |

`ui-store` persists to `localStorage` key `chanchi-ui`.

React Query config: `staleTime: 30s`, `retry: 1`, refetch-on-focus only in prod.

### Data layer

Generic CRUD factory in `src/lib/supabase-service.ts` — `findAll / findById / create / update / remove`. Domain services in `src/services/*.ts` extend this factory with custom queries (e.g. `transactionsService.monthlySummary()`).

Types come from `src/lib/database.types.ts` (Supabase-generated — do not edit manually).

### Feature modules

`src/features/<domain>/` owns components + hooks for each domain (accounts, auth, budgets, categories, dashboard, debts, investments, recurring, savings, transactions). Custom hooks combine React Query fetches + mutations; mutations invalidate related query keys on success.

### Components

- `src/components/ui/` — base primitives (Radix UI + Tailwind)
- `src/components/layout/` — AppLayout, Sidebar, MobileNav, TopBar
- Use `cn()` from `src/lib/utils.ts` for class merging

### Environment variables

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

### Styling

Tailwind CSS v4 via Vite plugin (no PostCSS). Variant/size systems use `Record<T, string>` maps inside components.
