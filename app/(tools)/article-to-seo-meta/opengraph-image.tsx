import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og/og-image";

export const runtime = "edge";
export const alt =
	"Article to SEO Meta — SEO-friendly titles and descriptions with character counts in spec";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
	return renderOgImage({
		eyebrow: "SEO meta generator · Open source",
		titleLead: "Article to",
		titleAccent: "SEO Meta",
		subtitle:
			"Titles 50-60 chars · Descriptions 150-160 chars · Primary keyword in every variation.",
		pills: ["Title 50-60", "Description 150-160", "1-3 variations"],
		accent: "#f59e0b",
		backgroundTint: "#3b2410",
	});
}
