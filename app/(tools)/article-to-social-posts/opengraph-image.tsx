import { ImageResponse } from "next/og";

import { SITE_DOMAIN } from "@/lib/config/site";

export const runtime = "edge";
export const alt =
	"Article to Social Posts — turn an article or draft into platform-optimized posts for X, LinkedIn, Threads, Bluesky, Mastodon, and Substack";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				padding: "80px",
				background:
					"radial-gradient(1000px 600px at 15% 10%, #052e1e 0%, #0a0a0a 60%)",
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
						background: "#34d399",
					}}
				/>
				<div style={{ display: "flex" }}>
					Social post generator · Open source
				</div>
			</div>

			<div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
				<div
					style={{
						display: "flex",
						flexDirection: "row",
						gap: "12px",
						alignItems: "center",
						justifyContent: "flex-start",
						flexWrap: "wrap",
						fontSize: "120px",
						fontWeight: 700,
						lineHeight: 1.0,
						letterSpacing: "-0.04em",
					}}
				>
					<div style={{ display: "flex" }}>Article</div>
					<div style={{ display: "flex" }}>to</div>
					<div style={{ display: "flex", color: "#34d399" }}>Social Posts</div>
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
					Turn an article or draft into platform-ready posts — with tone,
					hashtag rules, and X threads.
				</div>
			</div>

			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "20px",
					alignItems: "flex-start",
				}}
			>
				<div
					style={{
						display: "flex",
						gap: "14px",
						flexWrap: "wrap",
					}}
				>
					{["6 platforms", "URL or draft", "X threads"].map((p) => (
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
				<div
					style={{
						display: "flex",
						fontSize: "24px",
						color: "#a1a1aa",
					}}
				>
					{SITE_DOMAIN}
				</div>
			</div>
		</div>,
		{ ...size },
	);
}
