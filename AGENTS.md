<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

Operational rules for AI agents working in this repo. Keep the block above intact — it's auto-managed. For the full tool anatomy and dev setup, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## What this is

A hub of small, single-purpose web tools (Next.js 16 App Router, React 19, TypeScript, Tailwind v4). Two kinds of tool:

- **AI tools** (e.g. Article to SEO Meta, Article to Social Posts) — a `"use server"` action calls Gemini via the Vercel AI SDK. Server code is **kind-first** in `lib/`: the action in `lib/actions/<slug>.ts`, the agent in `lib/agents/<name>/agent.ts`.
- **Client-only tools** (e.g. Word Counter, Case Converter, Slug Generator, Reading Time) — run entirely in the browser: no server action.

`TOOLS` in `lib/config/tools.ts` is the single registry — one entry wires a tool into the home grid, navbar, and sitemap.

## Structure

- **`lib/` is kind-first, domain-within** — `config/ constants/ types/ hooks/ utils/ actions/ agents/` (plus `og/`, `rate-limit/`, `guides/`). No `lib/tools/` bucket. Each kind has a barrel; import as `@/lib/<kind>`.
- **`utils/ai/` is server-only** (reads `@env`) with its own barrel — never pull it into a client bundle; client-safe helpers live in `lib/utils/`.
- **`components/`** — `ui/` (primitives, barrel `@/components/ui`); `_shared/` (cross-feature: the `writer/` engine, `category/`, `result/`, `source/`, `page/`, `byok/`, `content/`, `tool/`); `layout/`; `home/`, `categories/`, `tools/` (the `/tools` directory page is `tools/index.tsx`; each tool is `tools/<slug>/`); `guides/`. Components hold `.tsx` only — hooks/constants/types live in `lib/`.

## Verify before you claim done

Run all three; never report success on an unverified change:

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

Prettier and the pre-commit hook handle formatting.

## Conventions that matter

- **Naming — no aliases, descriptive, no duplicates.** A module's file name, exported name, and usage must match; never rename on import (`import X as Y`). Names are descriptive over terse (`createGeminiClient`, not `getGemini`). Tool-specific components are **tool-prefixed** (`SeoMetaHero`, `SocialPostsWriter`) — no bare duplicate `Hero`/`HostedUsageNotice` across tools. Every exported **type ends in `…Type`**. Booleans read as assertions (`is…`/`has…`/`are…`).
- **Namespaced keys + events.** Every localStorage/sessionStorage key and custom DOM event name is built via `namespaced()` as `tbt:<area>:<name>` — storage keys in `constants/storage-keys.ts`, event names in `constants/events.ts`. Never inline a raw key/event string.
- **Comments only when non-obvious.** If deleting a comment wouldn't confuse a future reader, don't write it. Don't narrate what the code plainly does.
- **Semantic HTML + accessibility.** Real elements (`<dl>`, headings, lists, `<button>`), not div-soup. A jsx-a11y ruleset gates CI — keep labels, focus order, and keyboard paths intact.
- **Specific, self-contained copy.** Name the subject; avoid vague headings and deixis ("the box", "here"). UI text should stand alone.
- **No scope creep.** Do the task in front of you. Refactors, renames, and unrelated cleanups go in their own change.
- **Reuse the shared layer.** Before adding plumbing, check `lib/utils/ai/` (`createGeminiClient`, `resolvePlatformApiKey`, `enforceDailyQuota`, `generateSchemaOutputFromArticle`, `resolveArticleSource`, `toUserMessage`), `lib/utils/` (client-safe: `isBrowser`, `articleSourceIdentity`, the `createLocalStore`/`createHistoryStore` factories), and `components/_shared/` (incl. the `writer/` engine — `Writer`, `useWriter`, `WriterRuntimeType`).

## Git — ask first

- **Never commit, push, or open a PR unless the user explicitly asks.** Staging to show a diff is fine; committing is not.
- **Never commit to `main`** — branch first (`fix/…`, `feat/…`, `docs/…`).
- **Stage only files you changed this session.** Don't sweep in pre-existing modifications — the pre-commit hook re-stages, so check `git status` before committing.
- Conventional Commits (`type(scope): subject`); keep every line ≤100 chars.

## Environment

- `APP_ENV` gates production-only integrations (rate limiting) — set it explicitly on deploy; unset = `development`.
- BYOK Gemini keys live in the browser's `sessionStorage`, never on a server. Tool input is request-scoped, not logged or cached (URL fetches use a 1-hour in-memory cache).
- `pnpm-workspace.yaml` pins `postcss >=8.5.10` to patch a vulnerability Next still transitively pins. Re-check on Next upgrades.
