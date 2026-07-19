import type { ComponentType, ReactNode, SVGProps } from "react";

import ToolContent from "../content/ToolContent";
import ToolBreadcrumbs from "../tool/ToolBreadcrumbs";
import Navbar from "@/components/layout/Navbar";
import ToolMain from "@/components/layout/ToolMain";
import { PageHero } from "@/components/ui";
import { ROUTES } from "@/lib/config/routes";

type IconComponentType = ComponentType<SVGProps<SVGSVGElement>>;

type ClientToolPageProps = {
	/** Route segment, brand link, and content "more tools" key, e.g. "word-counter". */
	slug: string;
	/** Brand name shown in the navbar (and the base of its aria-label). */
	name: string;
	icon: IconComponentType;
	eyebrowLabel: string;
	title: ReactNode;
	subtitle: string;
	/** Constrain the hero + tool to a narrow column (e.g. the slug generator). */
	constrained?: boolean;
	/** The tool itself, rendered between the hero and the SEO content block. */
	children: ReactNode;
};

/**
 * Page shell shared by the client-only (no-API) tools: brand navbar, hero, the
 * tool, then the SEO content block. The AI tools keep their own shell because
 * they add BYOK, a usage notice, and a settings drawer to the navbar.
 */
export default function ClientToolPage({
	slug,
	name,
	icon,
	eyebrowLabel,
	title,
	subtitle,
	constrained,
	children,
}: ClientToolPageProps) {
	const hero = (
		<>
			<ToolBreadcrumbs slug={slug} name={name} />
			<PageHero
				className="mb-10"
				eyebrow={{ icon, label: eyebrowLabel }}
				title={title}
				subtitle={subtitle}
			/>
			{children}
		</>
	);

	return (
		<>
			<Navbar
				brand={{
					href: ROUTES.tool(slug),
					name,
					icon,
					ariaLabel: `${name} home`,
				}}
				showByok={false}
			/>
			<ToolMain>
				{constrained ? <div className="mx-auto max-w-3xl">{hero}</div> : hero}
				<ToolContent currentSlug={slug} />
			</ToolMain>
		</>
	);
}
