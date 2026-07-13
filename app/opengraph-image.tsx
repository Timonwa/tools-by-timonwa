import { SITE_NAME } from "@/lib/config/site";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og/og-image";

export const runtime = "edge";
export const alt = `${SITE_NAME} — Small, focused, open-source tools`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
	return renderOgImage({
		eyebrow: "Open source · MIT",
		titleLead: "Tools by",
		titleAccent: "Timonwa",
		subtitle:
			"Small, focused, open-source tools. One home for software that does one thing well.",
		pills: ["Free", "No sign-up", "Open source"],
		accent: "#818cf8",
		backgroundTint: "#1e1b4b",
	});
}
