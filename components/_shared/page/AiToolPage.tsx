import type { ComponentType, ReactNode, SVGProps } from "react";

import ToolContent, { type ToolContentType } from "../content/ToolContent";
import Navbar from "@/components/layout/Navbar";
import ToolMain from "@/components/layout/ToolMain";
import { ROUTES } from "@/lib/config/routes";

type IconComponentType = ComponentType<SVGProps<SVGSVGElement>>;

type AiToolPageProps = {
	/** Route segment, brand link, and content "more tools" key, e.g. "article-to-seo-meta". */
	slug: string;
	/** Brand name shown in the navbar (and the base of its aria-label). */
	name: string;
	icon: IconComponentType;
	/** Navbar centre slot — the tool's hosted-usage notice. */
	usageNotice: ReactNode;
	/** Optional navbar actions slot — e.g. a writing-preferences drawer. */
	settings?: ReactNode;
	content: ToolContentType;
	/** The tool's hero and body, rendered above the SEO content block. */
	children: ReactNode;
};

/**
 * Page shell shared by the AI tools: a navbar with the hosted-usage notice, the
 * BYOK control (on by default), and an optional settings drawer, then the tool
 * and its SEO content block. Client-only tools use ClientToolPage instead, which
 * drops BYOK and the usage notice and builds the hero from props.
 */
export default function AiToolPage({
	slug,
	name,
	icon,
	usageNotice,
	settings,
	content,
	children,
}: AiToolPageProps) {
	return (
		<>
			<Navbar
				brand={{
					href: ROUTES.tool(slug),
					name,
					icon,
					ariaLabel: `${name} home`,
				}}
				centerSlot={usageNotice}
				actionsSlot={settings}
			/>
			<ToolMain>
				{children}
				<ToolContent content={content} currentSlug={slug} />
			</ToolMain>
		</>
	);
}
