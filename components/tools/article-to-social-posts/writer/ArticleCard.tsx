"use client";

import { ClipboardCheckIcon, ClipboardCopyIcon } from "lucide-react";
import type {
	ArticlePreviewType,
	TokenUsageType,
} from "@/components/tools/article-to-social-posts/types";
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui";

type Props = {
	article: ArticlePreviewType;
	usage: TokenUsageType | null;
	copied: boolean;
	onCopyAll: () => void;
};

export default function ArticleCard({
	article,
	usage,
	copied,
	onCopyAll,
}: Props) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between gap-2">
					<CardTitle className="text-base">Article</CardTitle>
					<Button variant="ghost" size="sm" onClick={onCopyAll}>
						{copied ? (
							<>
								<ClipboardCheckIcon className="w-4 h-4" />
								Copied all
							</>
						) : (
							<>
								<ClipboardCopyIcon className="w-4 h-4" />
								Copy all posts
							</>
						)}
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<h4 className="font-semibold text-sm leading-snug mb-1">
					{article.title || "Untitled"}
				</h4>
				<div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
					{article.author && <span>by {article.author}</span>}
					{article.url ? (
						<a
							href={article.url}
							target="_blank"
							rel="noopener noreferrer"
							className="truncate hover:text-foreground underline underline-offset-2"
						>
							{article.url}
						</a>
					) : (
						<span className="italic">Pasted text</span>
					)}
					{usage && usage.totalTokens > 0 && (
						<span
							title={`Prompt: ${usage.promptTokens} · Completion: ${usage.completionTokens}`}
							className="font-mono"
						>
							· {usage.totalTokens.toLocaleString()} tokens
						</span>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
