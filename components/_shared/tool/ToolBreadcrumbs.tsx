import { Breadcrumbs } from "@/components/ui";
import type { BreadcrumbItemType } from "@/components/ui/Breadcrumbs";
import { getCategory } from "@/lib/config/categories";
import { ROUTES } from "@/lib/config/routes";
import { getPrimaryCategory, getToolBySlug } from "@/lib/config/tools";

/** Tool breadcrumb (Home › Tools › category › tool); the category deep-links the filtered /tools. */
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
		{ label: "Tools", href: ROUTES.tools },
		...(category
			? [{ label: category.label, href: ROUTES.toolsCategory(category.id) }]
			: []),
		{ label: name },
	];

	return <Breadcrumbs items={items} />;
}
