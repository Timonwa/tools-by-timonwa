import {
	Code2Icon,
	GaugeIcon,
	RulerIcon,
	ShieldCheckIcon,
	SparklesIcon,
	SproutIcon,
} from "lucide-react";

import { cn } from "@/lib/utils/cn";

const FEATURES = [
	{
		icon: ShieldCheckIcon,
		title: "Private by default",
		body: "The instant tools run right in your browser — nothing is uploaded. AI requests go straight to Google, and are never stored or used for training. Your drafts stay yours.",
		big: true,
	},
	{
		icon: SparklesIcon,
		title: "Free, no signup",
		body: "Every tool is free with a daily AI allowance. No account, no credit card.",
		chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
		border: "border-emerald-500/20",
	},
	{
		icon: RulerIcon,
		title: "Built to spec",
		body: "Character counts and platform limits are baked in, so output fits SEO and social.",
		chip: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
		border: "border-sky-500/20",
	},
	{
		icon: GaugeIcon,
		title: "Instant",
		body: "No installs, no page reloads — results appear as you type or in one request.",
		chip: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
		border: "border-amber-500/20",
	},
	{
		icon: Code2Icon,
		title: "Open source",
		body: "MIT-licensed and built in the open. Read the code or bring your own key.",
		chip: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
		border: "border-violet-500/20",
	},
	{
		icon: SproutIcon,
		title: "Growing collection",
		body: "New writing, developer, and publishing tools ship regularly — just getting started.",
		chip: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
		border: "border-rose-500/20",
	},
];

export default function WhyUseIt() {
	return (
		<section aria-labelledby="why-heading" className="mt-20 space-y-8 sm:mt-24">
			<div>
				<h2
					id="why-heading"
					className="text-2xl font-semibold tracking-tight sm:text-3xl"
				>
					Why use it
				</h2>
				<p className="mt-2 text-muted-foreground">
					Focused, fast, and respectful of your privacy.
				</p>
			</div>
			<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{FEATURES.map((feature) => {
					const Icon = feature.icon;

					if (feature.big) {
						return (
							<li
								key={feature.title}
								className="relative overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-br from-primary/15 via-primary/5 to-card p-6 sm:col-span-2 sm:p-8 lg:row-span-2"
							>
								<div
									aria-hidden
									className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl"
								/>
								<div className="relative">
									<span
										aria-hidden
										className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary"
									>
										<Icon className="h-6 w-6" />
									</span>
									<h3 className="mt-5 text-xl font-semibold">
										{feature.title}
									</h3>
									<p className="mt-2 max-w-md leading-relaxed text-muted-foreground">
										{feature.body}
									</p>
								</div>
							</li>
						);
					}

					return (
						<li
							key={feature.title}
							className={cn("rounded-xl border bg-card p-5", feature.border)}
						>
							<span
								aria-hidden
								className={cn(
									"flex h-10 w-10 items-center justify-center rounded-lg",
									feature.chip,
								)}
							>
								<Icon className="h-5 w-5" />
							</span>
							<h3 className="mt-4 font-semibold">{feature.title}</h3>
							<p className="mt-1 text-sm leading-relaxed text-muted-foreground">
								{feature.body}
							</p>
						</li>
					);
				})}
			</ul>
		</section>
	);
}
