"use client";

import { ClockIcon, HistoryIcon, TagIcon, Trash2Icon } from "lucide-react";

import type { HistoryEntryType } from "@/components/tools/article-to-seo-meta/hooks/use-history";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui";
import { timeAgo } from "@/lib/utils/time";

type HistorySidebarProps = {
	entries: HistoryEntryType[];
	onLoad: (entry: HistoryEntryType) => void;
	onRemove: (id: string) => void;
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
							{entries.map((h) => (
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
											<TagIcon aria-hidden className="w-3 h-3" />
											{h.variationCount} variation
											{h.variationCount > 1 ? "s" : ""}
										</div>
										<div className="text-xs font-medium line-clamp-2 mb-1 wrap-break-word">
											{h.source.kind === "url"
												? h.source.url
												: h.source.text.trim().slice(0, 120) || "Article draft"}
										</div>
										<div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-wrap">
											<ClockIcon className="w-3 h-3" />
											{timeAgo(h.timestamp)}
											<span>·</span>
											<span>
												{h.source.kind === "url"
													? "Link"
													: `${h.source.text.length.toLocaleString()} chars`}
											</span>
											{h.primaryKeyword && (
												<>
													<span>·</span>
													<span className="truncate">
														&ldquo;{h.primaryKeyword}&rdquo;
													</span>
												</>
											)}
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
							))}
						</ul>
					)}
				</CardContent>
			</Card>
		</aside>
	);
}
