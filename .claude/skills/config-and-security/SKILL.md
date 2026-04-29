---
name: config-and-security
description: Use this skill any time you're configuring environment variables, securing API access, writing or modifying proxy.ts (formerly middleware.ts), reviewing what's exposed to the client, or doing a pre-deploy security pass on a Next.js 16 app. Triggers include process.env, NEXT_PUBLIC_, .env.local, env validation with Zod or T3 Env, secret leakage, server-only / client-only packages, proxy.ts, the proxy() export, request matchers, edge vs nodejs runtime, cookies(), auth tokens, session cookies, bypass tokens, x-vercel-protection-bypass, the SWAG_BYPASS_TOKEN env var, Vercel deployment protection, exposed API keys, API route hardening, CORS, CSP, or "is it safe to ship this". Bundles Vercel Academy topics env-and-security, security-review-apis-and-config, and proxy-basics.
---

# Next.js 16 — Configuration and Security

This skill covers env vars (and how to keep secrets out of the client bundle), `proxy.ts` (which replaces `middleware.ts` in Next.js 16), and the security review you should run before shipping any Next.js app.

## Environment variables

### The two flavors

| Prefix | Available in | Example |
|---|---|---|
| `NEXT_PUBLIC_` | **Server and client** (inlined into the JS bundle at build time) | `NEXT_PUBLIC_API_URL` |
| no prefix | **Server only** | `SWAG_BYPASS_TOKEN`, `DATABASE_URL` |

This is the most important rule: **anything in `NEXT_PUBLIC_*` is shipped to every visitor's browser.** Do not put secrets there. Ever.

### Storing them

| File | Loaded in | Committed to git? |
|---|---|---|
| `.env` | All envs (lowest priority) | Yes (only with non-sensitive defaults) |
| `.env.local` | Local dev (and tests) | **No** — gitignore it |
| `.env.development` / `.env.production` | The matching `NODE_ENV` | Optional |
| Vercel Project Env Vars | The deployed app | n/a (set in dashboard or CLI) |

### Validating env vars at boot

Validate with Zod so a misconfigured env fails the build, not a runtime fetch deep in production:

```ts
// lib/env.ts
import { z } from "zod";

const env = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  SWAG_BYPASS_TOKEN: z.string().min(1),
}).parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  SWAG_BYPASS_TOKEN: process.env.SWAG_BYPASS_TOKEN,
});

export default env;
```

Import `env` everywhere instead of touching `process.env` directly. The build will refuse to compile if a required var is missing.

### Don't leak server env vars to client components

```ts
// lib/api/client.ts (server only)
const TOKEN = process.env.SWAG_BYPASS_TOKEN;
```

If a client component imports this file, the build will succeed but `TOKEN` will be `undefined` at runtime — except when Next.js inlines it into the bundle, which depending on circumstances **can leak the secret**. Add `import "server-only"` at the top of any module that reads non-public env vars:

```ts
import "server-only";
const TOKEN = process.env.SWAG_BYPASS_TOKEN;
```

Now any accidental client import is a build error.

## `proxy.ts` (replaces `middleware.ts`)

In Next.js 16, **`middleware.ts` was renamed to `proxy.ts`**. Functionality is the same; the rename was to clarify what it is — a network-edge proxy in front of your routes.

### Two important changes

1. **The file is `proxy.ts` and the export is `proxy`** (not `middleware`).
2. **The runtime is Node.js, not Edge.** You cannot opt back into Edge for `proxy.ts`. Edge runtime middleware is deprecated.

A codemod is available: `npx @next/codemod@latest middleware-to-proxy`.

### Anatomy

```ts
// proxy.ts (at the project root, next to next.config.ts)
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  // Examples of what proxy can do:
  // 1. Inspect/modify request headers
  // 2. Rewrite to a different URL (NextResponse.rewrite)
  // 3. Redirect (NextResponse.redirect)
  // 4. Set/read cookies
  // 5. Reject with NextResponse.json({...}, { status: 401 })

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply to all routes except _next, static files, and APIs you want untouched
    "/((?!_next/static|_next/image|favicon.ico|api/health).*)",
  ],
};
```

### When to use it

- Auth check: redirect unauthenticated users to `/login`
- A/B test cookie assignment
- Geographic routing (`request.geo.country` → rewrite to localized variant)
- Bot blocking
- Adding security headers globally

### When NOT to use it

- Heavy database queries (it runs on every matched request — slow proxy = slow site)
- Anything that should be a Server Action or Route Handler
- Auth checks that need access to your full DB schema (do them in layouts/pages, where caching is friendlier)

### Cart token in the Swag Store

You **do not** need `proxy.ts` to manage the cart token cookie. Use server actions and Route Handlers — they have access to `cookies()` from `next/headers` and that's the right place. `proxy.ts` is for cross-cutting concerns above the routing layer.

## API security checklist

The Swag Store API is gated by `x-vercel-protection-bypass`. That token must:

1. **Live only in `SWAG_BYPASS_TOKEN`** (no `NEXT_PUBLIC_` prefix).
2. **Be read only in server code** — your `lib/api/` wrappers, server actions, and route handlers.
3. **Never appear in props passed to client components** — even indirectly (e.g. don't include it in a returned API response).
4. **Be set in Vercel project env vars** for the deployed app, not just `.env.local`.

The cart token (`x-cart-token`) is **not** a secret in the same sense — it's a per-user opaque identifier. But:

- Store it as an `httpOnly` cookie so client JS can't read it.
- Set `secure: true` in production.
- Set `sameSite: "lax"` to prevent cross-site abuse.
- Set `maxAge` to 24h (matches the API's expiry — anything longer just creates dead cookies).

```ts
import { cookies } from "next/headers";

const cookieStore = await cookies();
cookieStore.set("cart_token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24,
});
```

## Headers and CSP

For a take-home, you don't need a strict CSP, but be aware:

- `next.config.ts` `headers()` lets you set response headers globally.
- Image domains must be in `images.remotePatterns` (CSP-adjacent — Next.js's image optimizer enforces it).
- For production apps, look up the Next.js security headers preset (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security`).

## Pre-deploy security review

Run through this list before submitting:

1. **`.env.local` is gitignored.** `git ls-files | grep .env.local` should be empty.
2. **No secrets in `NEXT_PUBLIC_*`.** Only public URLs and feature flags belong there.
3. **Server-only modules import `"server-only"`.** Try to import them from a `"use client"` file — should fail at build.
4. **Server Actions validate input.** Every `formData.get(...)` is run through Zod or manual checks.
5. **Server Actions authorize.** A `removeItemAction(itemId)` must scope to the current cart.
6. **Cookies are `httpOnly` + `secure` + `sameSite: "lax"`.**
7. **Error pages don't leak internals.** `error.message` is shown only in dev; production shows a generic message + `error.digest`.
8. **`generator` and `theme-color` meta tags are present** (assignment-specific, but still a "is it shipped correctly" check).

## Common mistakes

- Reading `process.env.SECRET` in a component file imported by a `"use client"` file → secret either becomes `undefined` or worse, gets bundled.
- Using the old `middleware.ts` name in Next.js 16 → file is silently ignored. The codemod renames it for you.
- Writing a session cookie without `httpOnly` → any third-party script with XSS access can steal it.
- Putting auth checks in `proxy.ts` that depend on full DB lookups → every request pays the latency.

Sources:
- [Renaming Middleware to Proxy](https://nextjs.org/docs/messages/middleware-to-proxy)
- [Upgrading: Version 16](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [File-system conventions: proxy.js](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
- [Environment Variables](https://nextjs.org/docs/app/guides/environment-variables)
