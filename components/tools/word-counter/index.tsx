import { WholeWordIcon } from "lucide-react";

import ToolContent from "@/components/_shared/ToolContent";
import Navbar from "@/components/layout/Navbar";
import ToolMain from "@/components/layout/ToolMain";
import { wordCounterContent } from "./content";
import WordCounterTool from "./WordCounterTool";
import { PageHero } from "@/components/ui";

export default function WordCounterPageContent() {
	return (
		<>
			<Navbar
				brand={{
					href: "/word-counter",
					name: "Word & Character Counter",
					icon: WholeWordIcon,
					ariaLabel: "Word & Character Counter home",
				}}
				showByok={false}
			/>
			<ToolMain>
				<PageHero
					className="mb-10"
					eyebrow={{ icon: WholeWordIcon, label: "Word & character counter" }}
					title={
						<>
							Count every <span className="hero-gradient-text">word</span> as
							you type
						</>
					}
					subtitle="Live word, character, sentence, and paragraph counts — plus reading time and the character limits that matter for SEO and social. Nothing leaves your browser."
				/>
				<WordCounterTool />
				<ToolContent content={wordCounterContent} currentSlug="word-counter" />
			</ToolMain>
		</>
	);
}
