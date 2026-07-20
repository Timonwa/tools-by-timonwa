import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og/og-image";

export const runtime = "edge";
export const alt = "Slug Generator — turn any text into a clean, URL-safe slug";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
	return renderOgImage({
		eyebrow: "Slug generator · Open source",
		titleLead: "Slug",
		titleAccent: "Generator",
		subtitle:
			"Turn any title, heading, or text into a clean, URL-safe slug — accents stripped, separator your call.",
		pills: ["URL-safe", "Stop words", "One-click copy"],
		accent: "#c084fc",
		backgroundTint: "#2e1065",
	});
}
