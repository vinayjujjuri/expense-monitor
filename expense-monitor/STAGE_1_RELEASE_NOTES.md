# Expense Monitor — Stage 1 (v1) Release Notes

Version: Stage 1 (v1)

Date: 2025-12-13

Overview
- Purpose: Minimal expense tracking web app built with Next.js (App Router) and TypeScript. Allows adding credits and debits and viewing simple analytics.
- Stack: Next.js, TypeScript, React, Node, MongoDB (Mongoose), PostCSS.

Implemented features

1. Pages
- `app/page.tsx` — Home / Dashboard page.
- `app/add-credit/page.tsx` — Add credit page (form).
- `app/add-debit/page.tsx` — Add debit page (form).
- `app/yearly-analytics/page.tsx` — Yearly analytics page.

2. API routes
- `app/api/credit/route.ts` — Credit creation and listing endpoint.
- `app/api/debit/route.ts` — Debit creation and listing endpoint.
- `app/api/analytics/monthly/route.ts` — Monthly aggregation endpoint.
- `app/api/analytics/yearly/route.ts` — Yearly aggregation endpoint.
- `app/api/analytics/yearly/categories/route.ts` — Category breakdown endpoint.

3. Data model
- `models/transaction.ts` — Transaction model (amount, date, category, type, note).

4. Database helper
- `libs/db.ts` — Mongoose connection helper.

5. UI components
- `components/navbar/index.tsx` — Navigation bar used across pages.
- `components/credit-form/index.tsx` — Credit entry component.
- `components/debit-form/index.tsx` — Debit entry component.
- `components/analytics/monthly-chart/index.tsx` — Monthly chart rendering.
- `components/analytics/yearly/index.tsx` — Yearly analytics UI.
- `components/analytics/yearly/categories/index.tsx` — Category breakdown UI.

6. Utilities & scripts
- `utils/constants.ts` — Application constants (categories, labels, etc.).
- `scripts/test-db.js` — DB connection test script.

Architecture and code structure
- App Router based Next.js project with server route handlers inside `app/api`.
- Mongoose is used for data modeling and persistence. `libs/db.ts` centralizes connection logic.
- Components are organized under `components/` and imported into pages.
- Global styles are in `app/globals.css` and PostCSS is configured via `postcss.config.mjs`.
- TypeScript configuration present in `tsconfig.json`.

API contract (summary)
- POST `/api/credit` — Create credit: { amount, date?, category?, note? } -> transaction
- POST `/api/debit` — Create debit: { amount, date?, category?, note? } -> transaction
- GET `/api/analytics/monthly` — Monthly summaries
- GET `/api/analytics/yearly` — Yearly summaries
- GET `/api/analytics/yearly/categories` — Category totals for year

How to run (developer)

Prerequisites
- Node 18+ (recommended)
- MongoDB instance (local or Atlas). Set `MONGODB_URI` in `.env.local`.

Install & run

```powershell
npm install
npm run dev
```

Build & run production

```powershell
npm run build
npm run start
```

Limitations (Stage 1)
- No authentication: single shared dataset.
- Minimal validation and error handling on API inputs.
- No automated tests included.
- Basic UI styling; accessibility improvements pending.
- Pagination and large dataset handling not implemented.
- No multi-currency or localization support.

Edge cases and assumptions
- `libs/db.ts` expects `MONGODB_URI` environment variable. If missing, DB operations will fail.
- APIs accept ISO date strings; pages default to current date when omitted.
- Numeric inputs should be sanitized on the client and server.

Files of interest (quick map)
- `app/page.tsx`, `app/layout.tsx`
- `app/add-credit/page.tsx`, `app/add-debit/page.tsx`
- `app/yearly-analytics/page.tsx`
- `app/api/*` (credit, debit, analytics)
- `components/*` (forms, navbar, analytics)
- `models/transaction.ts`, `libs/db.ts`

Recommended next steps (v2)
1. Add authentication (per-user data isolation)
	 - Goal: Secure user data and provide per-user transaction storage.
	 - Recommendation: Use NextAuth.js (for session-based auth) or Auth.js with JWTs depending on requirement. For later production, consider OAuth providers + email/password and account verification.
	 - Implementation steps:
		 1. Add `next-auth` (or `@auth/core`/Auth.js`) and configure providers (GitHub/Google/email).
		 2. Create `models/user.ts` to store user metadata and link transactions to `userId`.
		 3. Update `models/transaction.ts` to include `userId: string` index and owner checks.
		 4. Protect API routes: require session on write/read operations and use `userId` to scope queries.
		 5. Update client UI to show sign-in/sign-out and connect forms to the authenticated user.
	 - Env vars: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, provider secrets (e.g., `GITHUB_ID`, `GITHUB_SECRET`) and database connection remain required.
	 - Acceptance criteria:
		 - Users can sign up and sign in.
		 - Users only see their own transactions and analytics.

2. Extract data by year and month (user input filters)
	 - Goal: Allow users to request analytics and transaction lists filtered by arbitrary year and month inputs.
	 - API changes:
		 - Update analytics endpoints to accept query parameters or JSON body specifying `year` and optional `month`:
			 - GET `/api/analytics/monthly?year=2025&month=6` or POST body `{ year: 2025, month: 6 }`.
			 - GET `/api/analytics/yearly?year=2025`.
		 - Update credit/debit listing endpoints to accept `year` and `month` filters: `/api/credit?year=2025&month=6`.
	 - Implementation steps (server):
		 1. Validate incoming `year` and `month` (integers, month 1-12).
		 2. Compute date range for queries: start = new Date(year, month-1, 1), end = start of next month or year.
		 3. Add MongoDB query filters on `date` field and `userId` (when auth added):
				{ date: { $gte: start, $lt: end }, userId }
		 4. Return aggregated totals and optionally individual transactions.
	 - Implementation steps (client/UI):
		 1. Add a date selector UI on analytics pages — allow selecting year and month (month optional).
		 2. Pass the selected year/month to the analytics API and re-render charts/tables with the returned data.
		 3. Persist last-used filters in localStorage or user preferences.
	 - Acceptance criteria:
		 - User can request analytics for any year and month and receive correct totals.
		 - Transaction listings reflect the filter and pagination is supported for large result sets.

3. Related improvements
	 - Request validation: add `zod` schemas for query/body validation and return 400s for invalid input.
	 - Tests: add unit tests for date-range calculation and API contract tests for filtered endpoints.
	 - Migration: add a migration script to backfill existing transactions with `userId` if converting to per-user data (or treat previous data as global and add a `migration` flag).

4. Versioning and rollout
	 - Keep Stage 1 public API behavior for backward compatibility; introduce new optional query params.
	 - Feature-flag the auth rollout to allow graceful migration.

Summary
This Stage 2 roadmap adds authentication and flexible year/month extraction for analytics and listings. It includes recommended libraries, API contract changes, server and client implementation steps, environment variables, and acceptance criteria to validate completion.