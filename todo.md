# Tools by Timonwa — launch TODO

## Blocking — before launch

- [ ] Make the GitHub repo public (Settings → General → visibility).
- [x] Deploy to Vercel: connect the repo, point `tools.timonwa.com` at it (CNAME).
- [ ] Create an Upstash Redis DB ([console.upstash.com/redis](https://console.upstash.com/redis)); copy the REST URL + token.
- [ ] Set production env vars on the host:
  - `GOOGLE_API_KEY` (required) — plus optional per-tool keys `GOOGLE_API_KEY_ARTICLE_TO_SEO_META`, `GOOGLE_API_KEY_ARTICLE_TO_SOCIAL_POST`
  - `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (hosted rate limiting)
  - `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` (optional)
  - `LLM_MODEL` (optional — defaults to `gemini-2.5-flash-lite`)
- [ ] Cloudflare Web Analytics: add the domain, copy the token into the env var above.
- [ ] Confirm `tech.timonwa.com/terms`, `/privacy`, and `/code-of-conduct` cover the AI-tools + BYOK + self-hosting scope (README/footer link there).
- [ ] Clean local `.env` of any stale per-tool secrets.

## Done (in the codebase)

- [x] Per-tool metadata + JSON-LD (`app/(tools)/*/layout.tsx`); OG + Twitter images (`app/opengraph-image.tsx`, `app/twitter-image.tsx`).
- [x] SEO/PWA metadata routes — `app/robots.ts`, `app/sitemap.ts`, `app/manifest.ts` + icons (`favicon.ico`, `icon.png`, `apple-icon.png`).
- [x] Hosted rate limiting via Upstash (`lib/rate-limit`) — per-user + shared daily pool; BYOK skips both.
- [x] Prettier + ESLint; Husky + lint-staged pre-commit.

## Launch polish — ship without it, but matters for stars + sharing

- [ ] GitHub repo housekeeping: description, topics (`nextjs`, `adk-ts`, `ai-agents`, `seo`, `social-media`, `open-source`), social preview image, homepage → `tools.timonwa.com`.
- [ ] Verify the live deploy: OG preview via [opengraph.xyz](https://www.opengraph.xyz/); JSON-LD via [Google Rich Results Test](https://search.google.com/test/rich-results).
- [ ] Smoke test each tool on the hosted instance — free tier + BYOK, local history, mobile layout.
- [ ] Announce (X, LinkedIn, Bluesky) — dogfood with Article to Social Posts.

## Future — not blocking

- [ ] Add tool #3.
- [ ] Per-tool READMEs if a tool grows complex enough to warrant one.
