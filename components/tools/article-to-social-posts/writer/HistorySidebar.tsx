"use client";

import {
	ClockIcon,
	FileTextIcon,
	HistoryIcon,
	LinkIcon,
	Trash2Icon,
} from "lucide-react";
import type { HistoryEntryType } from "@/components/tools/article-to-social-posts/hooks/use-history";
import { timeAgo } from "@/components/tools/article-to-social-posts/utils/draft";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/Card";

type HistorySidebarProps = {
	entries: HistoryEntryType[];
	onLoad: (entry: HistoryEntryType) => void;
	onRemove: (id: string) => void;
};

const entryLabel = (h: HistoryEntryType): string => {
	if (h.preview.article.title) return h.preview.article.title;
	if (h.input.kind === "url") return h.input.url;
	const firstLine = h.input.text.trim().split("\n")[0] ?? "";
	return firstLine.slice(0, 80) || "Untitled draft";
};

export default function HistorySidebar({
	entries,
	onLoad,
	onRemove,
}: HistorySidebarProps) {
	return (
		<aside className="lg:sticky lg:top-20 self-start">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-sm">
						<HistoryIcon className="w-4 h-4" />
						Recent
					</CardTitle>
					<CardDescription className="text-xs">
						Stored locally in your browser.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{entries.length === 0 ? (
						<p className="text-xs text-muted-foreground">
							Your recent generations will appear here.
						</p>
					) : (
						<ul className="space-y-2">
							{entries.map((h) => {
								const isDraft = h.input.kind === "text";
								const Icon = isDraft ? FileTextIcon : LinkIcon;
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
												{isDraft ? "Draft" : "URL"}
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
										<button
											type="button"
											onClick={() => onRemove(h.id)}
											className="mt-1 text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
										>
											<Trash2Icon className="w-3 h-3" />
											Remove
										</button>
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
