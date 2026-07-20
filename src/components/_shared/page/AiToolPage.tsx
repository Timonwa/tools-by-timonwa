import type { ComponentType, ReactNode, SVGProps } from "react";

import ToolContent from "../content/ToolContent";
import ToolBreadcrumbs from "../tool/ToolBreadcrumbs";
import Navbar from "@/components/layout/Navbar";
import ToolMain from "@/components/layout/ToolMain";
import { ROUTES } from "@/lib/config/routes";

type IconComponentType = ComponentType<SVGProps<SVGSVGElement>>;

type AiToolPageProps = {
	slug: string;
	name: string;
	icon: IconComponentType;
	usageNotice: ReactNode;
	settings?: ReactNode;
	menuSlot?: ReactNode;
	children: ReactNode;
};

/** Page shell for the AI tools: navbar with usage notice, BYOK, optional settings drawer, then the tool + SEO content. */
export default function AiToolPage({
	slug,
	name,
	icon,
	usageNotice,
	settings,
	menuSlot,
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
				menuSlot={menuSlot}
			/>
			<ToolMain>
				<ToolBreadcrumbs slug={slug} name={name} />
				{children}
				<ToolContent currentSlug={slug} />
			</ToolMain>
		</>
	);
}
