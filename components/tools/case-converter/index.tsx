import { CaseSensitiveIcon } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import ToolMain from "@/components/layout/ToolMain";
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
			<ToolMain>
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
			</ToolMain>
		</>
	);
}
