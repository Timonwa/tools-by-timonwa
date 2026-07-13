import { ClockIcon } from "lucide-react";

import ToolContent from "@/components/_shared/ToolContent";
import Navbar from "@/components/layout/Navbar";
import ToolMain from "@/components/layout/ToolMain";
import { readingTimeContent } from "@/components/tools/reading-time/content";
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
			<ToolMain>
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
				<ToolContent content={readingTimeContent} currentSlug="reading-time" />
			</ToolMain>
		</>
	);
}
