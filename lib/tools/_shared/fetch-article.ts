import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";

/**
 * Fetch a public article URL and extract its readable title + text, so the AI
 * tools can work from clean article content without a model-driven fetch tool
 * (which forces a multi-step call and hits Gemini's `thoughtSignature`
 * requirement). Results are cached in-memory by URL for an hour, so a
 * regenerate doesn't re-fetch the same page.
 *
 * Throws coded errors ("404", "fetch failed", "paywall") that the action's
 * error mapper turns into plain-language messages.
 */
const TTL_MS = 60 * 60 * 1000;
const cache = new Map<
	string,
	{ title: string; text: string; expiresAt: number }
>();

export async function fetchArticleText(
	url: string,
): Promise<{ title: string; text: string }> {
	const hit = cache.get(url);
	if (hit && Date.now() < hit.expiresAt) {
		return { title: hit.title, text: hit.text };
	}

	let res: Response;
	try {
		res = await fetch(url, {
			redirect: "follow",
			headers: {
				"user-agent":
					"Mozilla/5.0 (compatible; ToolsByTimonwa/1.0; +https://tools.timonwa.com)",
			},
		});
	} catch {
		throw new Error("fetch failed: could not reach the URL");
	}

	if (res.status === 404) throw new Error("404: article not found");
	if (res.status === 401 || res.status === 403) {
		throw new Error("paywall or login required");
	}
	if (!res.ok) throw new Error(`fetch failed: HTTP ${res.status}`);

	const html = await res.text();
	const { document } = parseHTML(html);
	// linkedom's Document is structurally compatible with what Readability needs,
	// but not identical to the DOM lib's `Document` type — cast to bridge them.
	const parsed = new Readability(document as unknown as Document).parse();

	const title = (parsed?.title || document.title || "").trim();
	const text = (parsed?.textContent || document.body?.textContent || "")
		.replace(/[ \t]+/g, " ")
		.replace(/\n{3,}/g, "\n\n")
		.trim();

	if (!text) throw new Error("empty article: nothing readable at that URL");

	cache.set(url, { title, text, expiresAt: Date.now() + TTL_MS });
	return { title, text };
}
