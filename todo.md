# Blog to Social — launch TODO

## Blocking — must do before launch

- [ ] Rename the GitHub repo `timonwa/sproutwriter` → `timonwa/blog-to-social`. All internal links already point at the new name.
- [ ] Rename the local folder `.../sproutwriter` → `.../blog-to-social` (cosmetic — nothing references the folder name).
- [ ] Deploy to Vercel: new project, connect the renamed repo, point `blogtosocial.timonwa.com` at it.
- [ ] Create Upstash Redis database (free tier at [console.upstash.com/redis](https://console.upstash.com/redis)), copy the REST URL + token.
- [ ] Add env vars to Vercel: `GOOGLE_API_KEY` (required), `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (for rate limiting), `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` (optional), `LLM_MODEL` (optional).
- [ ] Cloudflare Web Analytics: add a site for the domain, copy the token into the env var above.
- [ ] Terms / Privacy / Cookies pages on `tech.timonwa.com` — the footer links to `/terms`, `/privacy`, `/cookies`. Confirm those pages exist. If there's no cookies page (cookieless analytics), remove the Cookies link from `src/components/layout/footer.tsx`.
- [ ] Clean up local `.env` — the old platform credentials (`LINKEDIN_ACCESS_TOKEN`, `TWITTER_*`, `BLUESKY_*`, `THREADS_*`, `MASTODON_*`) are ignored now but sitting there.
- [ ] Resolve the LLM error — `"The AI returned an unexpected response"`. Paste the raw `[blog-to-social:preview]` log line from the dev server to diagnose.

## Launch polish — ship without it, but matters for stars + sharing

- [ ] Open Graph image — 1200×630 PNG at `public/og-image.png`, referenced in layout.tsx metadata.
- [ ] Metadata expansion in `src/app/layout.tsx` — add `openGraph` and `twitter` blocks with title, description, image.
- [ ] GitHub repo housekeeping: description, topics (`nextjs`, `adk-ts`, `ai-agents`, `social-media`, `writers`, `open-source`), social preview image, homepage URL pointing at the deployed site.
- [ ] Announce on your own socials (X, LinkedIn, Bluesky) — dogfood the tool by generating the launch posts with it.

## Future — not blocking, add when it matters

- [x] ~~Server-side rate limit via Supabase/Firebase~~ — done via Upstash Redis. `src/lib/rate-limit.ts` enforces per-user (5/day) and shared pool (200/day); both reset at UTC midnight. BYOK skips both.
- [ ] Launcher site at `tools.timonwa.com` — wait until tool #2 exists before building this.
- [ ] Custom event tracking (requires a tool beyond Cloudflare Web Analytics). Revisit only if you want conversion funnels.
