import { ClockIcon } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import ReadingTimeTool from "@/components/tools/reading-time/ReadingTimeTool";
import { PageHero } from "@/components/ui";

export default function ReadingTimePageContent() {
	return (
		<>
			<Navbar
				brand={{
					href: "/reading-time",
					name: "Reading Time Estimator",
					icon: ClockIcon,
					ariaLabel: "Reading Time Estimator home",
				}}
				showByok={false}
			/>
			<main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-20 max-w-6xl">
				<PageHero
					className="mb-10"
					eyebrow={{ icon: ClockIcon, label: "Reading time estimator" }}
					title={
						<>
							How long is your <span className="hero-gradient-text">read</span>?
						</>
					}
					subtitle="Paste an article to see reading and speaking time at your chosen pace — and grab a copy-ready “X min read” label for the top of your post. Nothing leaves your browser."
				/>
				<ReadingTimeTool />
			</main>
		</>
	);
}
