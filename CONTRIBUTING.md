# Contributing to Tools by Timonwa

Thanks for your interest. **Tools by Timonwa** is an open-source collection of small, single-purpose tools. New tools are added selectively to keep the collection focused, but the code is open and help is very welcome:

- 🐛 Bug fixes
- ✨ UX / accessibility polish on existing tools
- 🤖 Agent-prompt / output-quality improvements
- 📝 Docs
- 💡 **New-tool suggestions** — open an issue; if it fits, it may get built
- 🔧 Code toward a new or existing tool — coordinate via an issue first

By participating, you agree to the [Code of Conduct](https://tech.timonwa.com/code-of-conduct).

## Before you start

- **Questions or ideas / tool suggestions** → open an [issue](https://github.com/Timonwa/tools-by-timonwa/issues/new/choose).
- **Bugs** → use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md).
- **Feature requests** → use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md).
- **Larger changes (incl. a new tool)** → open an issue first so we can agree on scope before you invest time.

## Scope — what fits this project

✅ In scope

- Bug fixes and UX polish
- Accessibility improvements
- Agent draft quality (prompt tweaks, tone/voice refinements)
- New **text-first, single-purpose tools** — AI-backed or client-only — that fit the "does one thing well" shape (coordinate first)
- Performance, build, and CI improvements
- Documentation

❌ Out of scope (forks welcome)

- OAuth / auto-publishing — the tools are copy-only by design
- Scheduling, calendars, cron-based posting
- User accounts or stored profiles
- Anything that requires a database

If you're not sure, open an issue and ask.

## Dev setup

**Prerequisites:** Node.js 20.9+, [pnpm](https://pnpm.io), and a [Google AI Studio key](https://aistudio.google.com/api-keys).

```bash
git clone https://github.com/Timonwa/tools-by-timonwa.git
cd tools-by-timonwa
pnpm install
cp .env.example .env      # add at least GOOGLE_API_KEY
pnpm dev
```

Open `http://localhost:3000`. See the README for the full [environment variables](./README.md#environment-variables) table.

## Scripts

| Command             | What it does             |
| ------------------- | ------------------------ |
| `pnpm dev`          | Dev server (Turbopack)   |
| `pnpm build`        | Production build         |
| `pnpm start`        | Run the production build |
| `pnpm lint`         | ESLint                   |
| `pnpm format`       | Prettier — write         |
| `pnpm format:check` | Prettier — check         |

Type-check with `pnpm exec tsc --noEmit`. A `pre-commit` hook runs **lint-staged** (ESLint `--fix` + Prettier) on staged files via **husky**, so most formatting is automatic.

## Codebase layout

Feature-grouped App Router. Routes stay thin; each tool's UI and server code live in parallel `tools/<slug>/` folders.

```text
app/
  layout.tsx  page.tsx  globals.css          # hub shell + landing
  manifest.ts  robots.ts  sitemap.ts          # SEO / PWA metadata routes
  icon.png  apple-icon.png  favicon.ico        # icons (Next metadata conventions)
  opengraph-image.tsx  twitter-image.tsx       # social share images
  error.tsx  not-found.tsx  global-error.tsx  loading.tsx
  (tools)/<slug>/                              # thin page.tsx + layout.tsx (metadata + JSON-LD)
components/
  ui/          # app-agnostic primitives (barrel: @/components/ui)
  _shared/     # cross-feature widgets (byok, source input, article card, history sidebar)
  layout/  theme/  marketing/home/
  tools/<slug>/  # sections, index.tsx (composer), hooks/, constants/
lib/
  config/      # site, tools, byok, limits, env
  tools/
    _shared/   # ai-provider, api-key, quota, draft-source, errors  (shared by AI tools)
    <slug>/    # actions.ts + agents/  (AI tools only; client-only tools have no lib/ folder)
  rate-limit/  utils/  types/
```

## Anatomy of a tool

When building or extending a tool, reuse the shared layer rather than re-implementing plumbing:

1. **Route** — `app/(tools)/<slug>/page.tsx` (thin: import + render the content component) and `layout.tsx` (metadata + JSON-LD).
2. **UI** — `components/tools/<slug>/`: section components + an `index.tsx` composer; co-locate `hooks/`, `constants/`, `types.ts`. Use primitives from `@/components/ui`.
3. **Server** _(AI tools only — client-only tools like the counters and converters stop at step 2)_ — `lib/tools/<slug>/actions.ts` (a `"use server"` action) + `agents/`. Reuse:
   - `generateStructuredFromDraft` — `lib/tools/_shared/draft-source` (runs the agent over a URL/text draft)
   - `getGemini` / `toTokenUsage` — `lib/tools/_shared/ai-provider`
   - `enforceQuota` / `readUsage` — `lib/tools/_shared/quota`
   - `toUserMessage` — `lib/tools/_shared/errors` · `resolveToolKey` — `lib/tools/_shared/api-key`
   - `createHistoryStore` — `lib/utils/create-history-store` (local history)
4. **Register** — add an entry to `TOOLS` in `lib/config/tools.ts`. It then appears in the home grid, navbar menu, and sitemap automatically.

## Code style

- **Formatting / linting:** Prettier + ESLint (flat config). The pre-commit hook fixes most of it; run `pnpm lint` and `pnpm format` before pushing.
- **TypeScript:** strict mode is on. Don't `any` your way out — if a type is hard, ask in the PR.
- **No comments unless non-obvious.** If removing a comment wouldn't confuse a future reader, don't write it.
- **No scope creep.** Fix the thing in the issue. Refactors, renames, and unrelated cleanups go in separate PRs.
- **Accessibility matters.** Keep semantic HTML, labels, focus order, and keyboard paths intact when touching UI.

## Agent prompt changes

Each tool's agent lives under `lib/tools/<slug>/agents/`. Prompt tweaks are welcome, but please:

- Include a **before/after example** in the PR — same input, old prompt vs. yours.
- Note any token-count impact (longer inputs = more cost per run).
- Test every input mode the tool supports (e.g. URL _and_ pasted text).

## Workflow

1. **Fork** and branch from `main`: `git checkout -b fix/what-you-are-fixing`.
2. **Make your change**, keeping the diff tight. Prefer editing existing files over creating new ones.
3. **Verify locally:**

   ```bash
   pnpm lint
   pnpm exec tsc --noEmit
   pnpm build
   ```

4. **Commit.** [Conventional Commits](https://www.conventionalcommits.org/) preferred — pick a type (`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`) with a clear subject.
5. **Push and open a PR** against `main`. Fill out the PR template (what/why, how to test).

## Reporting security issues

Don't open a public issue for security bugs — use [GitHub's private security advisories](https://github.com/Timonwa/tools-by-timonwa/security/advisories/new). See [SECURITY.md](./SECURITY.md).

## License

By contributing, you agree your work is released under the [MIT License](./LICENSE).
