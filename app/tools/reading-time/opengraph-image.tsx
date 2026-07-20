import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og/og-image";

export const runtime = "edge";
export const alt =
	"Reading Time Estimator — how long your article takes to read";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
	return renderOgImage({
		eyebrow: "Reading time estimator · Open source",
		titleLead: "Reading",
		titleAccent: "Time",
		subtitle:
			"Reading and speaking time at your pace — plus a copy-ready min-read label for your blog.",
		pills: ["Reading & speaking", "Adjustable WPM", "Min-read label"],
		accent: "#60a5fa",
		backgroundTint: "#172554",
	});
}
