import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og/og-image";

export const runtime = "edge";
export const alt =
	"Word & Character Counter — live word, character, and reading-time counts with platform limits";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
	return renderOgImage({
		eyebrow: "Word & character counter · Open source",
		titleLead: "Word & Character",
		titleAccent: "Counter",
		subtitle:
			"Words, characters, sentences, and reading time — with live limits for SEO, X, Bluesky, and LinkedIn.",
		pills: ["Live counts", "Reading time", "Platform limits"],
		accent: "#2dd4bf",
		backgroundTint: "#042f2e",
	});
}
