import { WrenchIcon } from "lucide-react";

import { PageHero } from "@/components/ui";
import { TINT_TEXT } from "@/lib/config/tints";
import { cn } from "@/lib/utils";

export default function Hero() {
	return (
		<div className="relative isolate py-10 sm:py-16">
			{/* Full-bleed ambient wash — breaks out of the max-w container to span the viewport (the root clips any overflow); blurred so it fades with no hard edges. */}
			<div
				aria-hidden
				className="pointer-events-none absolute -top-16 left-1/2 -z-10 w-screen -translate-x-1/2"
			>
				<div className="h-72 w-full rounded-full bg-linear-to-r from-tint-3/25 via-primary/20 to-tint-1/25 opacity-70 blur-[100px]" />
			</div>

			<PageHero
				className="mb-12 sm:mb-16"
				eyebrow={{ icon: WrenchIcon, label: "Open source" }}
				title={
					<>
						Small tools that{" "}
						<span className="hero-gradient-text">do one thing well</span>
					</>
				}
				subtitle={
					<>
						A growing collection of focused, open-source tools for{" "}
						<span className={cn("font-mono font-semibold", TINT_TEXT[1])}>
							writers
						</span>
						,{" "}
						<span className={cn("font-mono font-semibold", TINT_TEXT[2])}>
							developers
						</span>
						, and{" "}
						<span className={cn("font-mono font-semibold", TINT_TEXT[3])}>
							creators
						</span>
						. Pick one to get started.
					</>
				}
			/>
		</div>
	);
}
