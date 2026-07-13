import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og/og-image";

export const runtime = "edge";
export const alt =
	"Article to Social Posts — turn an article or draft into platform-optimized posts for X, LinkedIn, Threads, Bluesky, Mastodon, and Substack";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
	return renderOgImage({
		eyebrow: "Social post generator · Open source",
		titleLead: "Article to",
		titleAccent: "Social Posts",
		subtitle:
			"Turn an article or draft into platform-ready posts — with tone, hashtag rules, and X threads.",
		pills: ["6 platforms", "URL or draft", "X threads"],
		accent: "#34d399",
		backgroundTint: "#052e1e",
	});
}
