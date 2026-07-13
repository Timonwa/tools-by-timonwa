import { LinkIcon } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import ToolMain from "@/components/layout/ToolMain";
import SlugGeneratorTool from "@/components/tools/slug-generator/SlugGeneratorTool";
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
			<ToolMain className="max-w-3xl">
				<PageHero
					className="mb-10"
					eyebrow={{ icon: LinkIcon, label: "Slug generator" }}
					title={
						<>
							Titles into clean{" "}
							<span className="hero-gradient-text">URL slugs</span>
						</>
					}
					subtitle="Paste a title and get a tidy, URL-safe slug — accents and punctuation stripped, separator and stop words your call. Nothing leaves your browser."
				/>
				<SlugGeneratorTool />
			</ToolMain>
		</>
	);
}
