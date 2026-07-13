import { WrenchIcon } from "lucide-react";

import { PageHero } from "@/components/ui";

export default function Hero() {
	return (
		<PageHero
			className="mb-12 sm:mb-16"
			eyebrow={{ icon: WrenchIcon, label: "Open source · MIT" }}
			title={
				<>
					Small tools that{" "}
					<span className="hero-gradient-text">do one thing well</span>
				</>
			}
			subtitle="A growing collection of focused, open-source tools by Timonwa. Pick one to get started."
		/>
	);
}
