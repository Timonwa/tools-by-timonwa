"use client";

import { InfoIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { HOSTED_PER_USER_DAILY } from "@/components/tools/article-to-social-posts/constants/hosted-usage";
import { getUsage } from "@/lib/tools/article-to-social-posts/actions";
import { OPEN_BYOK_EVENT } from "@/lib/config/byok";

export default function HostedUsageNotice() {
	const [configured, setConfigured] = useState<boolean | null>(null);

	useEffect(() => {
		let cancelled = false;
		getUsage()
			.then((u) => {
				if (!cancelled) setConfigured(u.configured);
			})
			.catch(() => {
				if (!cancelled) setConfigured(false);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	if (!configured) return null;

	const summary = `${HOSTED_PER_USER_DAILY} free generations per person per day. Click to add your own Gemini key for unlimited use.`;

	const openByok = () => {
		window.dispatchEvent(new Event(OPEN_BYOK_EVENT));
	};

	return (
		<div className="group relative inline-flex">
			<button
				type="button"
				onClick={openByok}
				aria-label="Open settings to add your own Gemini key"
				className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/20 hover:bg-muted/50 hover:border-primary/40 transition-colors px-2.5 py-1 text-[10px] leading-tight text-muted-foreground sm:text-xs whitespace-nowrap cursor-pointer"
			>
				<InfoIcon aria-hidden className="w-3 h-3 shrink-0 opacity-70" />
				<span className="tabular-nums text-foreground/90">
					{HOSTED_PER_USER_DAILY} free/day
				</span>
			</button>
			<span
				role="tooltip"
				className="text-center pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-max max-w-[min(16rem,calc(100vw-1rem))] -translate-x-1/2 rounded-md border border-border/60 bg-popover/75 backdrop-blur-md px-2.5 py-1.5 text-[11px] leading-snug text-popover-foreground shadow-md opacity-0 translate-y-2 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0"
			>
				{summary}
			</span>
		</div>
	);
}
