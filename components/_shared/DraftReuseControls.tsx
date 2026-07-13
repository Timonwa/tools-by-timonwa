"use client";

import { Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

type DraftReuseControlsProps = {
	/** Unique id linking the checkbox to its label. */
	id: string;
	reuse: boolean;
	onToggleReuse: (next: boolean) => void;
	onClear: () => void;
	/** Whether there's anything to clear (disables the button when empty). */
	canClear: boolean;
	disabled?: boolean;
	className?: string;
};

/**
 * The opt-in "reuse this draft across tools" checkbox plus a Clear button.
 * Pairs with `useToolDraft`. When reuse is on the textarea *is* the shared
 * draft, so Clear relabels to "Clear shared draft" (with a matching tooltip) to
 * make plain it wipes the draft everywhere, not just this box. Unticking keeps
 * the text in this tool — it never blanks the field.
 */
export default function DraftReuseControls({
	id,
	reuse,
	onToggleReuse,
	onClear,
	canClear,
	disabled,
	className,
}: DraftReuseControlsProps) {
	return (
		<div
			className={cn(
				"flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5",
				className,
			)}
		>
			<label
				htmlFor={id}
				className="flex items-center gap-2 text-sm cursor-pointer select-none"
			>
				<input
					id={id}
					type="checkbox"
					checked={reuse}
					onChange={(e) => onToggleReuse(e.target.checked)}
					disabled={disabled}
					className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
				/>
				<span>Reuse this draft across tools</span>
			</label>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={onClear}
				disabled={disabled || !canClear}
				title={
					reuse
						? "Clears the draft here and in every tool that reuses it"
						: "Clears the text in this box"
				}
			>
				<Trash2Icon aria-hidden className="w-4 h-4" />
				{reuse ? "Clear shared draft" : "Clear"}
			</Button>
			<p className="w-full text-xs text-muted-foreground">
				{reuse
					? "Shared with your other article tools and saved in your browser. Untick to keep it only here."
					: "Stays in this tool only. Tick to reuse it across your other article tools."}
			</p>
		</div>
	);
}
