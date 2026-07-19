import { LinkIcon } from "lucide-react";

import ClientToolPage from "@/components/_shared/ClientToolPage";
import { slugGeneratorContent } from "./content";
import SlugGeneratorTool from "./SlugGeneratorTool";

export default function SlugGeneratorPageContent() {
	return (
		<ClientToolPage
			slug="slug-generator"
			name="Slug Generator"
			icon={LinkIcon}
			eyebrowLabel="Slug generator"
			title={
				<>
					Any text into clean{" "}
					<span className="hero-gradient-text">URL slugs</span>
				</>
			}
			subtitle="Paste a title, product name, or any text and get a tidy, URL-safe slug — accents and punctuation stripped, separator and stop words your call. Nothing leaves your browser."
			content={slugGeneratorContent}
			constrained
		>
			<SlugGeneratorTool />
		</ClientToolPage>
	);
}
