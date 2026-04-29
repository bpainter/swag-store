@AGENTS.md

# CLAUDE.md — Vercel Swag Store

## Project context
Vercel Partner Certification take-home. Next.js 16, TypeScript, Tailwind v4, shadcn/ui.
Goal: demonstrate Cache Components, Suspense, Server Actions, async params, dynamic vs static data.

## Mandatory cert requirements
- `cacheComponents: true` in next.config.ts
- `<meta name="generator" content="vswag-cert-v3">` on every page
- `<meta name="theme-color" content="#171719">` on every page

## Per-endpoint caching (see BUILD_PLAN.md §1.2)
Cached: products list/detail/search, categories, store config
Dynamic: stock, promotions, cart

## Conventions
- Server components are the default. Use "use client" only at the smallest interactive island.
- Server actions live next to the page that uses them (`app/<route>/actions.ts`).
- API calls go through `lib/api/`. Components never fetch directly.
- Bypass token is server-only. Files that read it must `import "server-only"`.
- Cart token cookie is httpOnly + secure (prod) + sameSite=lax + 24h maxAge.

## Specialist routing
For multi-step work, route through `swag-store-orchestrator`. Specialists:
- nextjs-architect — routing, layouts, caching, Suspense, error/not-found
- ui-builder — components, Tailwind, shadcn, images, fonts, metadata, perf
- api-integrator — API client, cart token, server actions, env, security

## Definition of done for a feature
- TypeScript clean (`pnpm typecheck`)
- Build succeeds (`pnpm build`)
- Lighthouse mobile ≥ 90 perf, ≥ 95 a11y on the route
- Generator + theme-color tags verified in rendered HTML
- Mobile-friendly at 375px and 768px
