import { Breadcrumbs } from "@/components/ui";
import type { BreadcrumbItemType } from "@/components/ui/Breadcrumbs";
import { getCategory } from "@/lib/config/categories";
import { ROUTES } from "@/lib/config/routes";
import { getPrimaryCategory, getToolBySlug } from "@/lib/config/tools";

/**
 * A tool page's breadcrumb: Home › <primary category> › <tool name>. The
 * category segment deep-links into the filtered `/tools` directory.
 */
export default function ToolBreadcrumbs({
	slug,
	name,
}: {
	slug: string;
	name: string;
}) {
	const tool = getToolBySlug(slug);
	const category = tool ? getCategory(getPrimaryCategory(tool)) : undefined;

	const items: BreadcrumbItemType[] = [
		{ label: "Home", href: ROUTES.home },
		...(category
			? [{ label: category.label, href: ROUTES.category(category.id) }]
			: []),
		{ label: name },
	];

	return <Breadcrumbs items={items} />;
}
