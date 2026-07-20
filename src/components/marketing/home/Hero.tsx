import { WrenchIcon } from "lucide-react";

import { PageHero } from "@/components/ui";
import { TINT_TEXT } from "@/lib/config/tints";
import { cn } from "@/lib/utils/cn";

export default function Hero() {
	return (
		<div className="relative isolate overflow-x-clip py-10 sm:py-16">
			{/* One soft, rounded, blurred gradient — fades at its edges so there's no
			    hard box, just an ambient wash of color behind the hero. */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-x-0 -top-16 -z-10 flex justify-center"
			>
				<div className="h-72 w-3xl max-w-full rounded-full bg-linear-to-r from-tint-3/25 via-primary/20 to-tint-1/25 opacity-70 blur-[100px]" />
			</div>

			<PageHero
				className="mb-12 sm:mb-16"
				eyebrow={{ icon: WrenchIcon, label: "Open source · MIT" }}
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
