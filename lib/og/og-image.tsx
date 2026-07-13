import { ImageResponse } from "next/og";

import { SITE_DOMAIN } from "@/lib/config/site";

/** Shared canvas + MIME for every OG / Twitter card. */
export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

export type OgImageConfig = {
	/** Eyebrow line, top-left. e.g. "SEO meta generator · Open source". */
	eyebrow: string;
	/** Title words in the default color (rendered before the accent words). */
	titleLead: string;
	/** Title words in the accent color. */
	titleAccent: string;
	/** One-line supporting copy under the title. */
	subtitle: string;
	/** Up to ~3 short pills under the description. */
	pills: string[];
	/** Accent hex — the status dot and the highlighted title words. */
	accent: string;
	/** Dark tint hex seeding the top-left radial glow. */
	backgroundTint: string;
	/** Upper bound for the title size in px (auto-shrinks to fit one line). */
	titleFontSize?: number;
};

/**
 * Render a branded 1200×630 social card. Every OG / Twitter route shares this:
 * a route exports `alt`/`size`/`contentType`/`runtime` and calls this with its
 * own copy and accent. Keep it dependency-light — it runs on the edge and uses
 * inline styles only (Satori supports no external CSS or components).
 */
export function renderOgImage(config: OgImageConfig) {
	const {
		eyebrow,
		titleLead,
		titleAccent,
		subtitle,
		pills,
		accent,
		backgroundTint,
		titleFontSize = 120,
	} = config;

	// Keep the whole title on a single line: shrink from the max size by the
	// character count so long names never wrap and break the layout. The canvas
	// is 1200px wide with 80px padding a side (~1040px usable); ~0.58 × size is a
	// safe average glyph width for the bold, tightly-tracked heading.
	const fullTitle = `${titleLead} ${titleAccent}`.replace(/\s+/g, " ").trim();
	const fitted = Math.floor(1040 / (fullTitle.length * 0.58));
	const fontSize = Math.max(56, Math.min(titleFontSize, fitted));
	const titleGap = Math.round(fontSize * 0.26);

	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				padding: "80px",
				background: `radial-gradient(1000px 600px at 15% 10%, ${backgroundTint} 0%, #0a0a0a 60%)`,
				color: "#fafafa",
				fontFamily: "sans-serif",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: "14px",
					fontSize: "26px",
					color: "#a1a1aa",
				}}
			>
				<div
					style={{
						width: "12px",
						height: "12px",
						borderRadius: "9999px",
						background: accent,
					}}
				/>
				<div style={{ display: "flex" }}>{eyebrow}</div>
			</div>

			<div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
				<div style={{ display: "flex", flexDirection: "column", gap: "26px" }}>
					<div
						style={{
							display: "flex",
							flexDirection: "row",
							flexWrap: "nowrap",
							alignItems: "baseline",
							gap: `${titleGap}px`,
							fontSize: `${fontSize}px`,
							fontWeight: 700,
							lineHeight: 1.0,
							letterSpacing: "-0.04em",
							whiteSpace: "nowrap",
						}}
					>
						<div style={{ display: "flex", whiteSpace: "nowrap" }}>
							{titleLead}
						</div>
						<div
							style={{ display: "flex", whiteSpace: "nowrap", color: accent }}
						>
							{titleAccent}
						</div>
					</div>
					<div
						style={{
							display: "flex",
							fontSize: "38px",
							color: "#d4d4d8",
							lineHeight: 1.3,
							maxWidth: "1000px",
						}}
					>
						{subtitle}
					</div>
				</div>

				<div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
					{pills.map((p) => (
						<div
							key={p}
							style={{
								display: "flex",
								padding: "12px 24px",
								borderRadius: "9999px",
								background: "rgba(255,255,255,0.06)",
								border: "1px solid rgba(255,255,255,0.14)",
								fontSize: "26px",
								color: "#e4e4e7",
							}}
						>
							{p}
						</div>
					))}
				</div>
			</div>

			<div style={{ display: "flex", fontSize: "24px", color: "#a1a1aa" }}>
				{SITE_DOMAIN}
			</div>
		</div>,
		{ ...OG_SIZE },
	);
}
