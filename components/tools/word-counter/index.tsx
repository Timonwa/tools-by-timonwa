import { WholeWordIcon } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import WordCounterTool from "@/components/tools/word-counter/WordCounterTool";
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
			<main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-20 max-w-6xl">
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
			</main>
		</>
	);
}
