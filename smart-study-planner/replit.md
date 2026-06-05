# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui + Framer Motion
- **Charts**: Recharts
- **State**: TanStack React Query (generated hooks from Orval)
- **Routing**: Wouter

## Project: Smart Study Planner

A full-stack task tracker and study planning app with:
- Task CRUD (add, edit, delete, complete)
- Priority levels: High / Medium / Low
- Categories: Study, Work, Personal
- Subtasks system
- Smart input parsing (#high @study tomorrow)
- Daily streak tracking
- Productivity statistics (weekly bar chart, category pie chart)
- Daily motivational quotes
- Dark mode (default dark)
- Progress bars per task and overall
- Greeting system (Good Morning/Afternoon/Evening, User)
- Study planner view (tasks grouped by due date)
- Ask AI button (opens ChatGPT)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server (port auto-assigned)
│   └── smart-study-planner/ # React + Vite frontend (at /)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
│       └── src/schema/
│           ├── tasks.ts    # Tasks table (with parent_id for subtasks)
│           └── users.ts    # Users table (streak, name)
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## API Routes

- `GET /api/healthz` — health check
- `GET /api/tasks` — list top-level tasks (filters: category, priority, completed)
- `POST /api/tasks` — create task
- `GET /api/tasks/:id` — get task by ID
- `PUT /api/tasks/:id` — update task
- `DELETE /api/tasks/:id` — delete task (also deletes subtasks)
- `PATCH /api/tasks/:id/complete` — toggle completion
- `GET /api/tasks/:id/subtasks` — list subtasks
- `POST /api/tasks/:id/subtasks` — create subtask
- `GET /api/user/profile` — get user profile
- `PUT /api/user/profile` — update user profile (name)
- `POST /api/user/streak` — record daily activity (updates streak)
- `GET /api/stats/overview` — stats overview (totals, completion rate, streak)
- `GET /api/stats/weekly` — weekly task stats (7 days)
- `GET /api/stats/by-category` — task counts by category
- `GET /api/quotes/daily` — daily motivational quote

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- Run codegen: `pnpm --filter @workspace/api-spec run codegen`
- Push DB schema: `pnpm --filter @workspace/db run push`

## Packages

### `artifacts/smart-study-planner` (`@workspace/smart-study-planner`)

React + Vite frontend. Pages in `src/pages/`, hooks in `src/hooks/`, components in `src/components/`.

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes in `src/routes/`.

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI 3.1 spec (`openapi.yaml`) and Orval config.

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client.
