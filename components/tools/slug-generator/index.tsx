import { LinkIcon } from "lucide-react";

import ToolContent from "@/components/_shared/ToolContent";
import Navbar from "@/components/layout/Navbar";
import ToolMain from "@/components/layout/ToolMain";
import { slugGeneratorContent } from "./content";
import SlugGeneratorTool from "./SlugGeneratorTool";
import { PageHero } from "@/components/ui";

export default function SlugGeneratorPageContent() {
	return (
		<>
			<Navbar
				brand={{
					href: "/slug-generator",
					name: "Slug Generator",
					icon: LinkIcon,
					ariaLabel: "Slug Generator home",
				}}
				showByok={false}
			/>
			<ToolMain>
				<div className="mx-auto max-w-3xl">
					<PageHero
						className="mb-10"
						eyebrow={{ icon: LinkIcon, label: "Slug generator" }}
						title={
							<>
								Any text into clean{" "}
								<span className="hero-gradient-text">URL slugs</span>
							</>
						}
						subtitle="Paste a title, product name, or any text and get a tidy, URL-safe slug — accents and punctuation stripped, separator and stop words your call. Nothing leaves your browser."
					/>
					<SlugGeneratorTool />
				</div>
				<ToolContent
					content={slugGeneratorContent}
					currentSlug="slug-generator"
				/>
			</ToolMain>
		</>
	);
}
