<div align="center">
  <h1>Tools by Timonwa</h1>
  <b>Small, focused, open-source web tools — each does one thing well.</b>
  <br/><br/>

<a href="https://tools.timonwa.com"><img alt="Live site" src="https://img.shields.io/website?url=https%3A%2F%2Ftools.timonwa.com&style=flat-square&label=tools.timonwa.com&up_message=online&down_message=offline" /></a>
<a href="https://github.com/Timonwa/tools-by-timonwa/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/Timonwa/tools-by-timonwa?style=flat-square&logo=github&label=stars&color=f5c518" /></a>
<a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-green?style=flat-square" /></a>
<a href="./CONTRIBUTING.md"><img alt="PRs welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" /></a>
<a href="https://tech.timonwa.com/code-of-conduct"><img alt="Contributor Covenant" src="https://img.shields.io/badge/Contributor%20Covenant-v2.1-7c3aed?style=flat-square" /></a>
<a href="https://tech.timonwa.com/support"><img alt="Support" src="https://img.shields.io/badge/Support-%E2%9D%A4-ea4aaa?style=flat-square&logo=githubsponsors&logoColor=white" /></a>

<br/>

<a href="https://nextjs.org"><img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-000?style=flat-square&logo=nextdotjs&logoColor=white" /></a>
<a href="https://react.dev"><img alt="React 19" src="https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react&logoColor=white" /></a>
<a href="https://www.typescriptlang.org"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" /></a>
<a href="https://tailwindcss.com"><img alt="Tailwind CSS v4" src="https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white" /></a>
<a href="https://ai-sdk.dev"><img alt="Vercel AI SDK" src="https://img.shields.io/badge/Vercel_AI_SDK-000?style=flat-square&logo=vercel&logoColor=white" /></a>
</div>

---

Focused web tools for everyday content work — AI tools that turn an article into SEO metadata or social posts, plus instant browser-side utilities for counting, converting, and slugifying text. Free to use, no sign-up, with an optional bring-your-own-key for unlimited AI runs.

**[tools.timonwa.com →](https://tools.timonwa.com)**

## Tools

**AI tools** — powered by Gemini; use the daily free quota or bring your own key.

| Tool                                                                             | What it does                                                                                                                                                           |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[Article to SEO Meta](https://tools.timonwa.com/article-to-seo-meta)**         | Generate SEO title and description variations sized to Google's display limits (50–60 / 150–160 chars), with an optional primary keyword in each.                      |
| **[Article to Social Posts](https://tools.timonwa.com/article-to-social-posts)** | Turn an article URL or draft into platform-optimized posts for X, LinkedIn, Threads, Bluesky, Mastodon, and Substack — with tone, voice, hashtag rules, and X threads. |

**Instant tools** — run entirely in your browser, no key, no account, nothing sent to a server.

| Tool                                                                   | What it does                                                                                 |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **[Word & Character Counter](https://tools.timonwa.com/word-counter)** | Live word, character, sentence, and reading-time counts, with per-platform character limits. |
| **[Case Converter](https://tools.timonwa.com/case-converter)**         | Switch text between UPPERCASE, Title Case, camelCase, snake_case, and more.                  |
| **[Slug Generator](https://tools.timonwa.com/slug-generator)**         | Turn any title or headline into a clean, URL-safe slug.                                      |
| **[Reading Time Estimator](https://tools.timonwa.com/reading-time)**   | Estimate reading and speaking time, with a copy-ready “X min read” label.                    |

_More on the way._

## Using the tools

- **Instant tools** — run fully in your browser. No key, no account, nothing leaves the page.
- **AI tools** — a daily free quota per tool, no account needed.
- **Bring your own key** — add a free [Google AI Studio](https://aistudio.google.com/api-keys) key in an AI tool's settings for unlimited runs. It stays in your browser, never on a server.
- **Copy-only** — the AI tools draft, you copy and post. No OAuth, no publishing, no stored credentials.

## Run locally

**Prerequisites:** Node.js 20.9+, [pnpm](https://pnpm.io), and a [Google AI Studio API key](https://aistudio.google.com/api-keys).

```bash
git clone https://github.com/Timonwa/tools-by-timonwa.git
cd tools-by-timonwa
pnpm install
cp .env.example .env      # add at least GOOGLE_API_KEY
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable                                | Required | Purpose                                                |
| --------------------------------------- | -------- | ------------------------------------------------------ |
| `GOOGLE_API_KEY`                        | ✅       | Gemini key powering the tools                          |
| `GOOGLE_API_KEY_ARTICLE_TO_SEO_META`    | —        | Optional per-tool key (falls back to `GOOGLE_API_KEY`) |
| `GOOGLE_API_KEY_ARTICLE_TO_SOCIAL_POST` | —        | Optional per-tool key                                  |
| `LLM_MODEL`                             | —        | Server model (default `gemini-flash-lite-latest`)      |
| `UPSTASH_REDIS_REST_URL` / `..._TOKEN`  | —        | Enables hosted daily rate limiting                     |

Built with Next.js 16, React 19, TypeScript, Tailwind CSS v4, the [Vercel AI SDK](https://ai-sdk.dev/) + Gemini, and Upstash Redis.

## Contributing

Contributions are welcome — bug fixes, UX and accessibility improvements, agent-prompt tweaks, docs, and ideas for new tools. See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup, scope, the codebase layout, and the PR workflow. By participating you agree to the [Code of Conduct](https://tech.timonwa.com/code-of-conduct).

## Privacy

- **Bring-your-own keys** live in your browser's `sessionStorage`, cleared on tab close — never on a server.
- **Your input** is sent to Google Gemini only for that request; not logged or stored (URL-based fetches are cached in memory for up to an hour).
- **History, preferences, and templates** live only in your browser's `localStorage`.
- **Rate-limit counters** store a keyed (HMAC-SHA256) hash of your IP plus a daily count in Upstash Redis (resets at UTC midnight); bring-your-own-key requests skip this.
- **No accounts, no profiles, no tracking, and no analytics** of any kind.

Full details: [tech.timonwa.com/privacy](https://tech.timonwa.com/privacy).

## Security

Please report vulnerabilities privately — see [SECURITY.md](./SECURITY.md). Don't open a public issue.

## License

MIT — see [LICENSE](./LICENSE).

## Support

- ⭐️ [Star the repo](https://github.com/Timonwa/tools-by-timonwa)
- ❤️ [Support](https://tech.timonwa.com/support)

---

Built by [Timonwa](https://links.timonwa.com). Open source · MIT.
