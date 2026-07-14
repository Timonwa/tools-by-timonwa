import { ArrowRightIcon } from "lucide-react";

import { LinkCard } from "@/components/ui";
import { TOOLS } from "@/lib/config/tools";

export default function ToolsGrid() {
	return (
		<section aria-label="Tools">
			<h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-4">
				Tools
			</h2>
			<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{TOOLS.map((t) => {
					const Icon = t.icon;
					const isSoon = t.status === "soon";
					return (
						<li key={t.slug}>
							<LinkCard href={t.href} disabled={isSoon}>
								<div className="mb-4 flex items-center justify-between">
									<span
										aria-hidden
										className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary"
									>
										<Icon className="w-5 h-5" />
									</span>
									{isSoon ? (
										<span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground border border-border rounded-full px-2 py-0.5">
											Soon
										</span>
									) : (
										<span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-primary">
											<span className="w-1.5 h-1.5 rounded-full bg-primary" />
											Live
										</span>
									)}
								</div>
								<h3 className="font-semibold text-lg leading-tight mb-1">
									{t.name}
								</h3>
								<p className="text-sm text-muted-foreground leading-snug mb-4 flex-1">
									{t.tagline}
								</p>
								{!isSoon && (
									<span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
										Open tool
										<ArrowRightIcon
											aria-hidden
											className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
										/>
									</span>
								)}
							</LinkCard>
						</li>
					);
				})}
			</ul>
		</section>
	);
}
