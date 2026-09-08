# CLAUDE.md

## Repo layout

No workspace tooling at root. Frontend and backend are independent — all commands must run from their respective directories.

```
cd frontend   # for frontend commands
cd backend    # for backend commands
```

## Non-discoverable commands

### Frontend
```bash
npm run test:ci        # one-shot test run (test script uses --watch, unsuitable for CI)
npm run lint           # --max-warnings 0: any warning is a failure
npm run build          # runs tsc first — TypeScript errors block the build
npm run type-check     # tsc --noEmit only, no build output
```

### Backend
```bash
npm run db:migrate     # prisma migrate dev — use for local schema changes
npm run db:migrate:deploy  # prisma migrate deploy — use for production/staging
npm run db:seed        # seeds sample data via ts-node prisma/seed.ts
npm run bulk-load      # imports CBSE question bank from QnA/CBSE/ into the DB
npm run db:reset       # ⚠ drops and recreates the DB — destructive
```

## Landmines

- **BigInt IDs everywhere**: PostgreSQL uses `BIGSERIAL`. Every ID crosses the JS boundary as a string and must be converted with `BigInt()` / `.toString()`. Do not use plain `number` for IDs.
- **No `.env.example` files**: Required env vars are not documented in the repo. Check `backend/src/config/` for what is read from `process.env` before touching env-dependent code.
- **Husky pre-commit hooks are wired** (`prepare: husky install`). If a commit fails unexpectedly, check `.husky/` for active hooks before using `--no-verify`.
- **`testConfig` is JSONB**: The `Test` model stores dynamic config (time limits, question counts, etc.) in a `testConfig` JSON column — not individual typed columns. Access it via the JSONB field, not top-level model fields.
- **`QuestionDraft` mirrors `Question`**: Bulk-loaded content lands in `QuestionDraft` and requires admin promotion before it appears in `Question`. Do not query `Question` expecting freshly bulk-loaded content.
- **No CI/CD pipeline**: There is no `.github/workflows/`. Tests and lint must be run manually before pushing.

## Content pipeline

CBSE question bank lives in `QnA/CBSE/Maths/`. To load it into the database:
```bash
cd backend
npm run bulk-load          # standard loader
npm run bulk-load-enhanced # enhanced variant (preferred for new content)
```

## Context files

Key files to read before working on specific areas:

**Database schema**
- @backend/prisma/schema.prisma — single source of truth for all 28 tables, relations, and enums

**API specification**
- @openapi-spec.yaml — full OpenAPI 3.0 spec; all endpoints, request/response shapes, and auth requirements

**Backend config & entry point**
- @backend/src/server.ts — middleware stack, route mounting, server bootstrap
- @backend/src/config/database.ts — Prisma client instantiation and DB config

**Auth system**
- @backend/src/middleware/auth.ts — `authenticate` and `authorize` middleware
- @backend/src/services/auth.service.ts — JWT generation, bcrypt, token refresh logic
- @frontend/src/store/authStore.ts — client-side session state (Zustand + localStorage)
- @frontend/src/services/api.ts — Axios singleton with request/response interceptors (token injection, auto-refresh)

**Frontend types**
- @frontend/src/types/index.ts — all shared TypeScript types used across the frontend

## React / TypeScript conventions

- Always include a typed `interface` or `type` for component props when writing or suggesting React components.

