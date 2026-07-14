import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og/og-image";

export const runtime = "edge";
export const alt = "Guides — Tools by Timonwa";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
	return renderOgImage({
		eyebrow: "Guides · Tools by Timonwa",
		titleLead: "Guides &",
		titleAccent: "walkthroughs",
		subtitle:
			"Short, practical guides for the tools — setup, tips, and step-by-step walkthroughs.",
		pills: ["Setup", "Tips", "Walkthroughs"],
		accent: "#818cf8",
		backgroundTint: "#1e1b4b",
	});
}
