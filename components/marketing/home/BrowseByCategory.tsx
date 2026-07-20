import CategoryGrid from "@/components/_shared/tool/CategoryGrid";
import { Section, SectionHeader } from "@/components/ui";

export default function BrowseByCategory() {
	return (
		<Section aria-labelledby="categories-heading" className="gap-6">
			<SectionHeader
				id="categories-heading"
				title="Browse by category"
				subtitle="Jump to the kind of tool you need — or see what's coming next."
			/>
			<CategoryGrid />
		</Section>
	);
}
