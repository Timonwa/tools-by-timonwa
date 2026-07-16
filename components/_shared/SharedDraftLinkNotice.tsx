import { LinkIcon } from "lucide-react";

/**
 * Shown in text-only tools (Word Counter, Reading Time) when the reused draft is
 * a URL rather than pasted text — there is no article text to work with. Pasting
 * text into the tool replaces the shared link (one shared draft at a time).
 */
export default function SharedDraftLinkNotice() {
	return (
		<p className="flex items-start gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
			<LinkIcon aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />
			<span>
				Your shared draft is a link, so there&rsquo;s no text to show here.
				Paste the article text to use it — that replaces the shared link.
			</span>
		</p>
	);
}
