<div align="center">
  <h1>Tools by Timonwa</h1>
  <b>Small, focused, open-source web tools — each does one thing well.</b>
  <br/><br/>

<a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-green?style=flat-square" /></a>
<a href="./CONTRIBUTING.md"><img alt="PRs welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" /></a>
<a href="https://tech.timonwa.com/code-of-conduct"><img alt="Contributor Covenant" src="https://img.shields.io/badge/Contributor%20Covenant-v2.1-7c3aed?style=flat-square" /></a>
<a href="https://nextjs.org"><img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-000?style=flat-square&logo=next.js" /></a>
<a href="https://tech.timonwa.com/sponsor"><img alt="Sponsor" src="https://img.shields.io/badge/Sponsor-%E2%9D%A4-ea4aaa?style=flat-square&logo=githubsponsors&logoColor=white" /></a>
</div>

---

AI-powered web tools for everyday content work — turn an article into SEO metadata, social posts, and more. Free to use, no sign-up, with an optional bring-your-own-key for unlimited runs.

**[tools.timonwa.com →](https://tools.timonwa.com)**

## Tools

| Tool                                                                             | What it does                                                                                                                                                           |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[Article to SEO Meta](https://tools.timonwa.com/article-to-seo-meta)**         | Generate SEO title and description variations sized to Google's display limits (50–60 / 150–160 chars), with an optional primary keyword in each.                      |
| **[Article to Social Posts](https://tools.timonwa.com/article-to-social-posts)** | Turn an article URL or draft into platform-optimized posts for X, LinkedIn, Threads, Bluesky, Mastodon, and Substack — with tone, voice, hashtag rules, and X threads. |

_More on the way._

## Using the tools

- **Free** — a daily quota per tool, no account needed.
- **Bring your own key** — add a free [Google AI Studio](https://aistudio.google.com/api-keys) key in a tool's settings for unlimited runs. It stays in your browser, never on a server.
- **Copy-only** — the tools draft, you copy and post. No OAuth, no publishing, no stored credentials.

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

| Variable                                 | Required | Purpose                                                |
| ---------------------------------------- | -------- | ------------------------------------------------------ |
| `GOOGLE_API_KEY`                         | ✅       | Gemini key powering the tools                          |
| `GOOGLE_API_KEY_ARTICLE_TO_SEO_META`     | —        | Optional per-tool key (falls back to `GOOGLE_API_KEY`) |
| `GOOGLE_API_KEY_ARTICLE_TO_SOCIAL_POST`  | —        | Optional per-tool key                                  |
| `LLM_MODEL`                              | —        | Server model (default `gemini-2.5-flash-lite`)         |
| `UPSTASH_REDIS_REST_URL` / `..._TOKEN`   | —        | Enables hosted daily rate limiting                     |
| `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` | —        | Cloudflare Web Analytics beacon. Omit → disabled       |

Built with Next.js 16, React 19, TypeScript, Tailwind CSS v4, [ADK-TS](https://adk.iqai.com/) + Gemini, and Upstash Redis.

## Contributing

Contributions are welcome — bug fixes, UX and accessibility improvements, agent-prompt tweaks, docs, and ideas for new tools. See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup, scope, the codebase layout, and the PR workflow. By participating you agree to the [Code of Conduct](https://tech.timonwa.com/code-of-conduct).

## Privacy

- **Bring-your-own keys** live in your browser's `sessionStorage`, cleared on tab close — never on a server.
- **Your input** is sent to Google Gemini only for that request; not logged or stored (URL-based fetches are cached in memory for up to an hour).
- **History, preferences, and templates** live only in your browser's `localStorage`.
- **Rate-limit counters** store a SHA-256 hash of your IP plus a daily count in Upstash Redis (resets at UTC midnight); bring-your-own-key requests skip this.
- **No accounts, no profiles, no cross-session tracking.** Optional analytics use cookieless [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/).

Full details: [tech.timonwa.com/privacy](https://tech.timonwa.com/privacy).

## Security

Please report vulnerabilities privately — see [SECURITY.md](./SECURITY.md). Don't open a public issue.

## License

MIT — see [LICENSE](./LICENSE).

## Support

- ⭐️ [Star the repo](https://github.com/Timonwa/tools-by-timonwa)
- ❤️ [Sponsor](https://tech.timonwa.com/sponsor)

---

Built by [Timonwa](https://links.timonwa.com). Open source · MIT.
