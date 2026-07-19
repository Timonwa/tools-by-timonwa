import CategoryGrid from "@/components/_shared/tool/CategoryGrid";

export default function BrowseByCategory() {
	return (
		<section
			aria-labelledby="categories-heading"
			className="mt-20 space-y-6 sm:mt-24"
		>
			<div>
				<h2
					id="categories-heading"
					className="text-2xl font-semibold tracking-tight sm:text-3xl"
				>
					Browse by category
				</h2>
				<p className="mt-2 text-muted-foreground">
					Jump to the kind of tool you need — or see what&apos;s coming next.
				</p>
			</div>
			<CategoryGrid />
		</section>
	);
}
