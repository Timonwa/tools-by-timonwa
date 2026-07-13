import { CaseSensitiveIcon } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import CaseConverterTool from "@/components/tools/case-converter/CaseConverterTool";
import { PageHero } from "@/components/ui";

export default function CaseConverterPageContent() {
	return (
		<>
			<Navbar
				brand={{
					href: "/case-converter",
					name: "Case Converter",
					icon: CaseSensitiveIcon,
					ariaLabel: "Case Converter home",
				}}
				showByok={false}
			/>
			<main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-20 max-w-5xl">
				<PageHero
					className="mb-10"
					eyebrow={{ icon: CaseSensitiveIcon, label: "Case converter" }}
					title={
						<>
							Fix the <span className="hero-gradient-text">case</span> in one
							click
						</>
					}
					subtitle="Switch text between UPPERCASE, Title Case, Sentence case, camelCase, snake_case, and more — instantly, then copy. Nothing leaves your browser."
				/>
				<CaseConverterTool />
			</main>
		</>
	);
}
