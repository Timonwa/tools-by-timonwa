"use client";

import {
	ClockIcon,
	FileTextIcon,
	HistoryIcon,
	LinkIcon,
	Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import type { HistoryEntryType } from "@/components/tools/article-to-social-posts/hooks/use-history";
import { timeAgo } from "@/components/tools/article-to-social-posts/utils/draft";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui";

type HistorySidebarProps = {
	entries: HistoryEntryType[];
	onLoad: (entry: HistoryEntryType) => void;
	onRemove: (id: string) => void;
};

const entryLabel = (h: HistoryEntryType): string => {
	if (h.preview.article.title) return h.preview.article.title;
	if (h.input.kind === "url") return h.input.url;
	const firstLine = h.input.text.trim().split("\n")[0] ?? "";
	return firstLine.slice(0, 80) || "Untitled";
};

export default function HistorySidebar({
	entries,
	onLoad,
	onRemove,
}: HistorySidebarProps) {
	// Two-step remove: the first click arms the confirm, the second removes.
	const [confirmingId, setConfirmingId] = useState<string | null>(null);

	return (
		<aside className="lg:sticky lg:top-20 self-start">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-sm">
						<HistoryIcon className="w-4 h-4" />
						History
					</CardTitle>
					<CardDescription className="text-xs">
						Your last 10 generations, saved in this browser. Re-generating an
						article updates its entry — history isn&apos;t kept per run.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{entries.length === 0 ? (
						<p className="text-xs text-muted-foreground">
							Your generations will appear here.
						</p>
					) : (
						<ul className="space-y-2 max-h-104 overflow-y-auto pr-1">
							{entries.map((h) => {
								const isText = h.input.kind === "text";
								const Icon = isText ? FileTextIcon : LinkIcon;
								const confirming = confirmingId === h.id;
								return (
									<li
										key={h.id}
										className="group rounded-md border border-border p-2 hover:bg-accent/50 transition-colors"
									>
										<button
											type="button"
											onClick={() => onLoad(h)}
											className="w-full text-left"
										>
											<div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
												<Icon aria-hidden className="w-3 h-3" />
												{isText ? "Text" : "URL"}
											</div>
											<div className="text-xs font-medium line-clamp-2 mb-1">
												{entryLabel(h)}
											</div>
											<div className="flex items-center gap-2 text-[10px] text-muted-foreground">
												<ClockIcon className="w-3 h-3" />
												{timeAgo(h.timestamp)}
												<span>·</span>
												<span>{h.platforms.length} platforms</span>
											</div>
										</button>

										{confirming ? (
											<div className="mt-1 flex items-center gap-2 text-[10px]">
												<button
													type="button"
													onClick={() => {
														onRemove(h.id);
														setConfirmingId(null);
													}}
													className="font-medium text-destructive hover:underline"
												>
													Confirm remove
												</button>
												<button
													type="button"
													onClick={() => setConfirmingId(null)}
													className="text-muted-foreground hover:text-foreground"
												>
													Cancel
												</button>
											</div>
										) : (
											<button
												type="button"
												onClick={() => setConfirmingId(h.id)}
												className="mt-1 text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
											>
												<Trash2Icon className="w-3 h-3" />
												Remove
											</button>
										)}
									</li>
								);
							})}
						</ul>
					)}
				</CardContent>
			</Card>
		</aside>
	);
}
