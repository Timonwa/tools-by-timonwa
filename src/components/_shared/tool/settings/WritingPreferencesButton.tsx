"use client";

import { ChevronRightIcon, PenLineIcon } from "lucide-react";

import { OPEN_SETTINGS_EVENT } from "@/lib/constants";

/** Generate-form entry point that opens the Writing preferences drawer. */
export default function WritingPreferencesButton({
	disabled,
}: {
	disabled?: boolean;
}) {
	return (
		<button
			type="button"
			onClick={() => window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT))}
			disabled={disabled}
			aria-haspopup="dialog"
			className="group flex items-center gap-2.5 rounded-md border border-border bg-muted/30 p-2.5 text-left transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
		>
			<PenLineIcon aria-hidden className="w-4 h-4 shrink-0 text-primary" />
			<span className="flex min-w-0 flex-col">
				<span className="text-sm font-medium">Writing preferences</span>
				<span className="text-[11px] text-muted-foreground">
					Voice, emoji, hashtags, post length &amp; more
				</span>
			</span>
			<ChevronRightIcon
				aria-hidden
				className="ml-auto w-4 h-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
			/>
		</button>
	);
}
