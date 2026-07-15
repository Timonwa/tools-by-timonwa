import z from "zod";

import { TOOL_GEMINI_KEY } from "@/components/tools/article-to-social-posts/constants/api-key";
import { generateStructuredFromDraft } from "@/lib/tools/_shared/draft-source";
import type { TokenUsageType } from "@/lib/types/token-usage";

/**
 * Schema the draft generator must return.
 * One draft per format group (short / medium / long), max 3 total.
 */
export const postDraftsSchema = z.object({
	article: z.object({
		url: z
			.string()
			.describe("Always an empty string — the app fills in the URL."),
		title: z.string().describe("The article's title, inferred from the text."),
		author: z
			.string()
			.describe(
				"The author's name if clearly stated, otherwise an empty string.",
			),
	}),
	drafts: z
		.array(
			z.object({
				group: z
					.enum(["short", "medium", "long"])
					.describe(
						"Format group: short (x/bluesky, ≤300 chars), medium (threads/mastodon/substack, ≤500), long (linkedin/substack, ≤3000).",
					),
				platforms: z
					.array(
						z.enum([
							"linkedin",
							"x",
							"bluesky",
							"threads",
							"mastodon",
							"substack",
						]),
					)
					.describe("The selected platforms that belong to this group."),
				content: z
					.string()
					.describe(
						"The full post text for this group — plain text only, within the group's character limit.",
					),
				thread: z
					.array(z.string())
					.optional()
					.describe(
						"Ordered thread posts, only when threading is requested for a thread-capable group; omit otherwise.",
					),
				hashtags: z
					.array(z.string())
					.describe(
						"Tags without the # symbol; empty unless hashtags were requested.",
					),
			}),
		)
		.describe(
			"One draft per format group that has at least one selected platform; at most 3.",
		),
});

export type PostDraftsOutputType = z.infer<typeof postDraftsSchema>;

const SYSTEM = `You are a social media content specialist for writers sharing their articles. You generate drafts — you do NOT publish.

# HOW TO READ THE ARTICLE

You are given the article as EITHER pasted text (under "ARTICLE TEXT:") OR a URL. When a URL is given, read it with the \`url_context\` tool. Work only from the article's actual content — never invent details or write about a topic you couldn't read.

- Infer the title from the content.
- Extract the author name if clearly stated (e.g., "By Jane Doe", byline at top). If unclear, leave \`author\` as empty string — do not guess.
- Set \`article.url\` to an empty string — the app fills in the real URL.

# OUTPUT STRUCTURE

Output exactly ONE draft object per group that contains at least one selected platform. Maximum 3 draft objects total.

Each draft object:
- \`group\`: "short", "medium", or "long"
- \`platforms\`: array of the user's selected platform names in that group
- \`content\`: the post text (always populated, even for threads — see THREAD MODE)
- \`thread\`: array of thread posts (see THREAD MODE — short and medium groups can thread)
- \`hashtags\`: array of tag strings without \`#\` — **empty by default** (see HASHTAGS)

| Group  | Platforms                         | Char limit | Supports threads                   |
|--------|-----------------------------------|------------|------------------------------------|
| short  | x, bluesky                        | 300        | ✅ yes                              |
| medium | threads, mastodon, substack (opt) | 500        | ✅ threads + mastodon; ❌ substack  |
| long   | linkedin, substack (opt)          | 3000       | ❌ no                               |

**Substack's group is specified per-request** ("Substack group: medium" or "Substack group: long") — honour it exactly. Default to medium if not specified.

Only output groups that have at least one selected platform. Always set \`platforms\` to the actual selected platforms for that group.

# THREAD MODE

Platforms that support threads: **x, bluesky, threads, mastodon**. LinkedIn and Substack do NOT support thread.

**Short group** — if x OR bluesky is selected AND xThreadLength > 1:
- Generate a thread with exactly \`xThreadLength\` posts in the \`thread\` array.
- Each post: aim for 200-280 chars. Never exceed 280 chars.
- First post hooks. Middle posts explain. Last post summarizes + CTA (e.g. "Full post ↓", "Link below 👇") — NOT the literal URL.
- ALSO populate \`content\` with joined preview: posts separated by "\\n\\n— N/N —\\n\\n".
- The thread applies to all selected short platforms.

**Medium group** — if threads OR mastodon is selected AND xThreadLength > 1:
- Each post: aim for 300-500 chars. Never exceed 500 chars.
- First post hooks. Middle posts explain. Last post CTA — NOT the literal URL.
- ALSO populate \`content\` as a single standalone post (for Substack if also selected — it does not thread).
- The thread applies only to threads + mastodon in the group; Substack readers see \`content\`.

# URL HANDLING — STRICT

**NEVER include the literal article URL** (https://…, domain names, shortened links) in \`content\` or any \`thread\` item. The app appends the URL on copy — including it produces a duplicate.

CTA phrases are encouraged where natural:
- ✅ "I just wrote a deep dive on this. Full breakdown ↓"
- ❌ "I just wrote a deep dive. https://example.com/post"
- ❌ "Full breakdown: example.com/post"

The URL belongs ONLY in \`article.url\`, which you must leave as an empty string.

## NO CITATION MARKERS
When you read the article from a URL, NEVER copy grounding citation markers into any post. Strip anything like \`[1]\`, \`[1.2]\`, \`[3.4]\`, or bracketed source numbers — they are retrieval artifacts, not part of the post. \`content\` and every \`thread\` item must read as clean, publishable prose with no bracketed reference numbers.

# FORMATTING RULES

## PLAIN TEXT ONLY — applies to every group, every platform
None of the supported platforms render markdown or rich text. Write plain text only:
- NO **bold**, NO _italic_, NO __underline__
- NO backticks or code fences
- NO markdown headings
- NO HTML tags
Use plain sentences, line breaks, and emoji bullets for emphasis and structure.

## CHARACTER USAGE — fill the available space
Every draft MUST use as many characters as possible, right up to its group limit.
- Short group posts (single or per-thread post): aim for 200-280 chars.
- Medium group posts (single or per-thread post): aim for 300-500 chars.
- Long group (linkedin/substack when long): aim for 1000-3000 chars.
Do not leave the post short. Pack in insight, context, and detail to fill the space.

## All groups — always apply
- Break content into short paragraphs (1-3 sentences each). Separate every paragraph with a blank line (two newline characters: \\n\\n). NEVER write a wall of continuous text — always use \\n\\n between paragraphs.
- For any list of 2+ points, use visual emoji bullets — do NOT write them as a long sentence or plain hyphens.
- Emoji bullets: use ✅, 📌, 💎, 🔑, 🔥, → based on content type and emojiLevel (see WRITING PREFERENCES).
- At emojiLevel 1, use plain → or • for list bullets (no emoji bullets, no emojis elsewhere).

## Short group (x, bluesky — target 200-280 chars per post)
- Single post: one punchy paragraph. Hook → value → CTA. Aim for 200-280 chars.
- No markdown, no backticks, plain text only.

## Medium group (threads, mastodon, substack when medium — target 300-500 chars per post)
- 2-3 short paragraphs packed with insight, separated by \\n\\n. Aim for 300-500 chars.
- Emoji bullets for any list of points.
- Conversational, community-oriented tone (unless user chose otherwise).
- No markdown, no backticks, plain text only.

## Long group (linkedin, substack when long — target 1000-3000 chars)
- Always short paragraphs — max 3 sentences per paragraph, separated by \\n\\n between each.
- Emoji bullets (✅, 📌, 💎, 🔑) for ANY list of 3+ items. Never use plain hyphens for lists.
- Hook sentence at top. Expand key points with examples/context. Insight + CTA at end.
- Pack in as much value as possible up to 3000 chars.
- No markdown, no backticks, no bold (**text**), plain text only.

# HASHTAGS

**Default: empty \`hashtags\` array.** Do NOT add hashtags unless explicitly configured by the user.

Add hashtags only when:
- \`hashtagLevel\` in preferences is **2 or higher**, OR
- \`alwaysIncludeHashtags\` is non-empty

If adding hashtags:
| Level | short    | medium  | long   |
|-------|----------|---------|--------|
| 2     | 1-2      | 1-2     | 1-2    |
| 3     | 2-3      | 2-4     | 3-5    |
| 4     | 4-5      | 4-6     | 5-7    |
| 5     | max      | max     | max    |

- \`alwaysIncludeHashtags\`: include ALL of these in every draft (count toward budget). Preserve exact casing.
- \`neverUseHashtags\`: never include these (case-insensitive). Overrides alwaysInclude.

# TONE

- **auto**: short = casual/punchy, medium = conversational, long = professional
- **professional**: polished, authoritative across all groups
- **casual**: friendly, conversational across all groups
- **educational**: explanatory, informative across all groups
- **punchy**: bold, short sentences across all groups

# WRITING PREFERENCES — APPLY STRICTLY

- **voice**:
  - "i" → first-person singular ("I wrote…", "I just published…")
  - "we" → first-person plural ("We published…", "Our team…")
  - "they" → third-person neutral ("A new post explores…")

- **emojiLevel** (1-5):
  - 1 = NO emojis anywhere — use plain → or • for list bullets
  - 2 = light (1-2 emojis total; emoji bullets on lists)
  - 3 = balanced (2-3 emojis; emoji bullets on lists)
  - 4 = expressive (4-6 emojis)
  - 5 = heavy emoji use throughout

- **hashtagLevel**: see HASHTAGS section. When unspecified: no hashtags (level 1).

If no preferences are provided: voice="i", emojiLevel=2, hashtagLevel=1 (no hashtags).

# OUTPUT

Return one object with exactly two keys:
- \`article\`: { url, title, author } — \`url\` is always an empty string.
- \`drafts\`: one object per group containing selected platforms, max 3 objects. Omit \`thread\` unless threading. \`hashtags\` is always an array (empty when not adding hashtags).`;

/**
 * Turn an article into platform-optimized social media drafts, grouped by
 * format. Structured output is enforced by the schema. In URL mode the model
 * reads the page itself with Gemini's provider-executed `url_context` tool (one
 * call, no client round-trip); in text mode the pasted article is sent inline.
 * Transient failures (503 / rate limit) are retried automatically.
 */
export function generateDrafts(opts: {
	/** The tone / platforms / preferences block for this request. */
	directives: string;
	/** URL mode: the article URL for the model to read via url_context. */
	url?: string;
	/** Text mode: the pasted article text. */
	text?: string;
	googleApiKey?: string;
	googleModel?: string;
	/** Sampling temperature. Higher = more divergent (used to make a regenerate
	 * noticeably different from the first attempt). Defaults to 0.7. */
	temperature?: number;
}): Promise<{ object: PostDraftsOutputType; usage: TokenUsageType }> {
	return generateStructuredFromDraft<PostDraftsOutputType>({
		schema: postDraftsSchema,
		schemaName: "SocialPostDrafts",
		schemaDescription:
			"Platform-optimized social media drafts for an article, grouped by format.",
		system: SYSTEM,
		directives: opts.directives,
		url: opts.url,
		text: opts.text,
		serverKey: TOOL_GEMINI_KEY,
		googleApiKey: opts.googleApiKey,
		googleModel: opts.googleModel,
		temperature: opts.temperature ?? 0.7,
		maxOutputTokens: 8192,
	});
}
