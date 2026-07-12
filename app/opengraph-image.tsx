import { ImageResponse } from "next/og";

import { SITE_DOMAIN, SITE_NAME } from "@/lib/config/site";

export const runtime = "edge";
export const alt = `${SITE_NAME} — Small, focused, open-source tools`;
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
					"radial-gradient(1000px 600px at 15% 10%, #1e1b4b 0%, #0a0a0a 60%)",
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
						background: "#818cf8",
					}}
				/>
				<div style={{ display: "flex" }}>Open source · MIT</div>
			</div>

			<div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						fontSize: "120px",
						fontWeight: 700,
						lineHeight: 1.0,
						letterSpacing: "-0.04em",
					}}
				>
					<div style={{ display: "flex" }}>Tools by</div>
					<div style={{ display: "flex", color: "#818cf8" }}>Timonwa</div>
				</div>
				<div
					style={{
						display: "flex",
						fontSize: "40px",
						color: "#d4d4d8",
						lineHeight: 1.3,
						maxWidth: "1000px",
					}}
				>
					Small, focused, open-source tools. One home for software that does one
					thing well.
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
					{["Article to Social Posts", "More soon"].map((p) => (
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
