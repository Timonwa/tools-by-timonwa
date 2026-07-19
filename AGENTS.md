<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

Operational rules for AI agents working in this repo. Keep the block above intact — it's auto-managed. For the full tool anatomy and dev setup, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## What this is

A hub of small, single-purpose web tools (Next.js 16 App Router, React 19, TypeScript, Tailwind v4). Two kinds of tool:

- **AI tools** (e.g. Article to SEO Meta, Article to Social Posts) — a `"use server"` action calls Gemini via the Vercel AI SDK, with server code under `lib/tools/<slug>/`.
- **Client-only tools** (e.g. Word Counter, Case Converter, Slug Generator, Reading Time) — run entirely in the browser: no server action, no `lib/tools/<slug>/` folder.

`TOOLS` in `lib/config/tools.ts` is the single registry — one entry wires a tool into the home grid, navbar, and sitemap.

## Verify before you claim done

Run all three; never report success on an unverified change:

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

Prettier and the pre-commit hook handle formatting.

## Conventions that matter

- **Naming — no aliases.** A module's file name, exported name, and usage must match. Shared modules (`components/_shared/`, `lib/tools/_shared/`) get **unique, descriptive** names. Never rename on import (`import X as Y`). Duplicate names are allowed **only** per-feature (e.g. each tool's own `Hero`, `HostedUsageNotice`) and only when never aliased.
- **Comments only when non-obvious.** If deleting a comment wouldn't confuse a future reader, don't write it. Don't narrate what the code plainly does.
- **Semantic HTML + accessibility.** Real elements (`<dl>`, headings, lists, `<button>`), not div-soup. A jsx-a11y ruleset gates CI — keep labels, focus order, and keyboard paths intact.
- **Specific, self-contained copy.** Name the subject; avoid vague headings and deixis ("the box", "here"). UI text should stand alone.
- **No scope creep.** Do the task in front of you. Refactors, renames, and unrelated cleanups go in their own change.
- **Reuse the shared layer.** Before adding plumbing, check `lib/tools/_shared/` (ai-provider, api-key, quota, draft-source, errors) and `components/_shared/`.

## Git — ask first

- **Never commit, push, or open a PR unless the user explicitly asks.** Staging to show a diff is fine; committing is not.
- **Never commit to `main`** — branch first (`fix/…`, `feat/…`, `docs/…`).
- **Stage only files you changed this session.** Don't sweep in pre-existing modifications — the pre-commit hook re-stages, so check `git status` before committing.
- Conventional Commits (`type(scope): subject`); keep every line ≤100 chars.

## Environment

- `APP_ENV` gates production-only integrations (rate limiting) — set it explicitly on deploy; unset = `development`.
- BYOK Gemini keys live in the browser's `sessionStorage`, never on a server. Tool input is request-scoped, not logged or cached (URL fetches use a 1-hour in-memory cache).
- `pnpm-workspace.yaml` pins `postcss >=8.5.10` to patch a vulnerability Next still transitively pins. Re-check on Next upgrades.
