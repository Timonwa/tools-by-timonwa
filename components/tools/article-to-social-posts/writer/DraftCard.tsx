"use client";

import {
	ClipboardCheckIcon,
	ClipboardCopyIcon,
	Loader2Icon,
	RefreshCwIcon,
} from "lucide-react";
import {
	PLATFORM_COLORS,
	PLATFORM_ICONS,
	PLATFORM_LABELS,
} from "../constants/platforms";
import type { PostDraftType } from "../types";
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Textarea,
	Tooltip,
} from "@/components/ui";

type Props = {
	draft: PostDraftType;
	isRegenerating: boolean;
	busy: boolean;
	copied: boolean;
	onContentChange: (content: string) => void;
	onThreadPostChange: (index: number, content: string) => void;
	onCopy: () => void;
	onRegenerate: () => void;
};

export default function DraftCard({
	draft,
	isRegenerating,
	busy,
	copied,
	onContentChange,
	onThreadPostChange,
	onCopy,
	onRegenerate,
}: Props) {
	const isThread = draft.thread && draft.thread.length > 1;
	const regenLabel = isThread
		? "Regenerate this thread"
		: "Regenerate this post";
	const Icon = PLATFORM_ICONS[draft.platform];
	const label = PLATFORM_LABELS[draft.platform];
	const limit = draft.charLimit;
	const over = draft.charCount > limit;

	return (
		<Card className="min-w-0 break-inside-avoid">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-base flex-wrap">
					<Icon
						aria-hidden
						className={`w-4 h-4 shrink-0 ${PLATFORM_COLORS[draft.platform]}`}
					/>
					<span className="leading-snug">
						{label}
						{isThread && ` · Thread (${draft.thread?.length})`}
					</span>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{isThread ? (
					<div className="space-y-2">
						{draft.thread?.map((post, i) => {
							const postOver = post.length > limit;
							return (
								<div
									// stable order
									key={i}
									className="rounded-md border border-border bg-muted/30 p-2 space-y-1"
								>
									<div className="text-[10px] text-muted-foreground">
										{i + 1} / {draft.thread?.length}
									</div>
									<Textarea
										aria-label={`${label} thread post ${i + 1} of ${draft.thread?.length}`}
										value={post}
										onChange={(e) => onThreadPostChange(i, e.target.value)}
										className="resize-none text-sm"
									/>
									<div
										className={`text-[10px] text-right font-mono ${
											postOver
												? "text-destructive font-semibold"
												: post.length > limit * 0.9
													? "text-yellow-500 dark:text-yellow-400"
													: "text-muted-foreground"
										}`}
									>
										{post.length} / {limit}
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<>
						<Textarea
							aria-label={`${label} post content`}
							value={draft.content}
							onChange={(e) => onContentChange(e.target.value)}
							className={
								limit >= 1500
									? "h-64 resize-y [field-sizing:normal]"
									: "resize-none"
							}
						/>
						<output
							aria-label={`${draft.charCount} of ${limit} characters used`}
							className={`block text-xs font-mono text-right ${
								over
									? "text-destructive font-semibold"
									: draft.charCount > limit * 0.9
										? "text-yellow-500 dark:text-yellow-400"
										: "text-muted-foreground"
							}`}
						>
							{draft.charCount} / {limit}
						</output>
					</>
				)}

				{draft.hashtags.length > 0 && (
					<div className="flex flex-wrap gap-1">
						{draft.hashtags.map((h) => (
							<span
								key={h}
								className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground"
							>
								#{h.replace(/^#/, "")}
							</span>
						))}
					</div>
				)}

				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						className="flex-1"
						onClick={onCopy}
					>
						{copied ? (
							<>
								<ClipboardCheckIcon className="w-4 h-4" />
								Copied
							</>
						) : (
							<>
								<ClipboardCopyIcon className="w-4 h-4" />
								Copy
							</>
						)}
					</Button>

					<Tooltip label={regenLabel}>
						<Button
							variant="outline"
							size="sm"
							onClick={onRegenerate}
							disabled={busy}
							aria-label={regenLabel}
						>
							{isRegenerating ? (
								<Loader2Icon className="w-4 h-4 animate-spin" />
							) : (
								<RefreshCwIcon className="w-4 h-4" />
							)}
						</Button>
					</Tooltip>
				</div>
			</CardContent>
		</Card>
	);
}
