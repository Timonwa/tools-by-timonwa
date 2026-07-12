# Contributing to Blog to Social Posts

Thanks for your interest in contributing. This is a small, focused tool — bug fixes, small UX improvements, platform tweaks, and agent-prompt refinements are all welcome.

## Before you start

- **Questions or ideas** → open a [GitHub Discussion](https://github.com/Timonwa/tools-by-timonwa/discussions).
- **Bugs** → use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md).
- **Feature requests** → use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md).
- **Larger changes** → open an issue first so we can sanity-check scope before you invest time.

By participating, you agree to the [Code of Conduct](https://tech.timonwa.com/code-of-conduct).

## Scope — what fits this project

✅ In scope

- Bug fixes and UX polish
- Improving the agent's draft quality (prompt tweaks, tone/voice refinements)
- Better accessibility
- Support for additional platforms that fit the current shape — text-first platforms where writers naturally share their articles (like the current six: X, LinkedIn, Threads, Bluesky, Mastodon, Substack Notes)
- Performance, build, and CI improvements
- Documentation

❌ Out of scope (forks welcome)

- OAuth / auto-publishing to platforms — the tool is copy-only by design
- Scheduling, calendars, cron-based posting
- User accounts or stored profiles
- Anything that requires a database

If you're not sure, open an issue and ask.

## Dev setup

Prerequisites: Node.js ≥ 22, pnpm, a Google AI Studio key.

```bash
git clone https://github.com/Timonwa/tools-by-timonwa.git
cd blog-to-social
pnpm install
cp .env.example .env
# Edit .env — only GOOGLE_API_KEY is required.
pnpm dev
```

Open `http://localhost:3000`.

## Scripts

| Command          | What it does                                             |
| ---------------- | -------------------------------------------------------- |
| `pnpm dev`       | Next.js dev server (Turbopack)                           |
| `pnpm build`     | Production build                                         |
| `pnpm start`     | Run the production build                                 |
| `pnpm check`     | Biome: format + safe lint fixes (run before committing)  |
| `pnpm lint`      | Biome lint only                                          |
| `pnpm format`    | Biome format only                                        |
| `pnpm typecheck` | TypeScript `--noEmit`                                    |

A `pre-commit` hook runs `biome format --write` on staged files via `husky` + `lint-staged`, so most formatting is automatic.

## Workflow

1. **Fork** the repo and create a branch from `main`:

   ```bash
   git checkout -b fix/what-you-are-fixing
   ```

2. **Make your change**, keeping the diff tight. Prefer editing existing files over creating new ones.
3. **Verify locally:**

   ```bash
   pnpm check
   pnpm typecheck
   pnpm build
   ```

4. **Commit.** [Conventional Commits](https://www.conventionalcommits.org/) are preferred but not enforced — pick a type that fits (`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`) and write a clear subject.

   ```text
   fix: prevent duplicate URL when agent appends it inline
   feat: add copy-each-thread-post button for X threads
   docs: clarify BYOK scope in README
   ```

5. **Push and open a PR** against `main`. Fill out the PR template — two short sections (what/why, how to test) and one checkbox.

## Code style

- **Formatting / linting:** [Biome](https://biomejs.dev/). `pnpm check` fixes what it can.
- **TypeScript:** strict mode is on. Don't `any` your way out — if a type is hard, ask in the PR.
- **No comments unless non-obvious.** If removing a comment wouldn't confuse a future reader, don't write it.
- **No scope creep.** Fix the thing in the issue. Refactors, renames, and unrelated cleanups go in separate PRs.
- **Accessibility matters.** Keep semantic HTML, labels, focus order, and keyboard paths intact when touching UI.

## Agent prompt changes

The draft-generator agent's instruction lives in [src/agents/draft-generator/agent.ts](src/agents/draft-generator/agent.ts). Prompt tweaks are welcome but please:

- Include a **before/after example** in the PR — paste the same article URL with the old prompt vs. yours, for 2–3 platforms.
- Note any token-count impact (inputs getting longer = more cost per generation).
- Test both URL mode and draft (paste) mode — they share the same agent.

## Reporting security issues

Don't open a public issue for security bugs. Use [GitHub's private security advisories](https://github.com/Timonwa/tools-by-timonwa/security/advisories/new).

## License

By contributing, you agree your work is released under the [MIT License](./LICENSE).
