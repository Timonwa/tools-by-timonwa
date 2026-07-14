import { splitGuideTitle } from "@/lib/guides/guides";
import { getGuide, getGuideSlugs } from "@/lib/guides/loader";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og/og-image";

export const alt = "How-to guide — Tools by Timonwa";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
	return getGuideSlugs().map((slug) => ({ slug }));
}

export default async function Image({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const guide = getGuide(slug);
	if (!guide) return new Response("Not found", { status: 404 });

	const { lead, accent } = splitGuideTitle(guide);
	return renderOgImage({
		eyebrow: `${guide.eyebrow} · Tools by Timonwa`,
		titleLead: lead.trim(),
		titleAccent: accent,
		subtitle: guide.ogSubtitle,
		pills: guide.ogPills,
		accent: guide.ogAccent,
		backgroundTint: guide.ogBackgroundTint,
	});
}
