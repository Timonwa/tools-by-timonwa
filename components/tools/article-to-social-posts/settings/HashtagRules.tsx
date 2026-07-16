"use client";

import { HashIcon, XIcon } from "lucide-react";
import { useId, useState } from "react";
import {
	MAX_HASHTAG_RULES_PER_LIST,
	normalizeHashtag,
} from "@/components/tools/article-to-social-posts/constants/preferences";
import type { WritingPreferencesType } from "@/components/tools/article-to-social-posts/types";
import { Input } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

type HashtagRulesProps = {
	prefs: WritingPreferencesType;
	onChange: (patch: Partial<WritingPreferencesType>) => void;
};

type FieldType = "alwaysIncludeHashtags" | "neverUseHashtags";

export default function HashtagRulesSection({
	prefs,
	onChange,
}: HashtagRulesProps) {
	const headingId = useId();

	const add = (field: FieldType, raw: string) => {
		const tag = normalizeHashtag(raw);
		if (!tag) return;
		const current = prefs[field];
		const dupe = current.some((t) => t.toLowerCase() === tag.toLowerCase());
		if (dupe || current.length >= MAX_HASHTAG_RULES_PER_LIST) return;
		onChange({ [field]: [...current, tag] });
	};

	const remove = (field: FieldType, tag: string) => {
		onChange({ [field]: prefs[field].filter((t) => t !== tag) });
	};

	return (
		<section aria-labelledby={headingId} className="space-y-4">
			<div className="flex items-center gap-2">
				<HashIcon aria-hidden className="w-4 h-4 text-primary" />
				<h3 id={headingId} className="text-sm font-semibold">
					Hashtag rules
				</h3>
			</div>
			<p className="text-xs text-muted-foreground">
				Fixed rules the agent applies to every post. Tag suggestions from the
				agent still follow your hashtag-level setting above.
			</p>

			<TagList
				label="Always include"
				helper="Added to every generated post (counts toward the hashtag budget)."
				tags={prefs.alwaysIncludeHashtags}
				onAdd={(raw) => add("alwaysIncludeHashtags", raw)}
				onRemove={(tag) => remove("alwaysIncludeHashtags", tag)}
			/>

			<TagList
				label="Never use"
				helper="Filtered out of every post (case-insensitive)."
				tags={prefs.neverUseHashtags}
				onAdd={(raw) => add("neverUseHashtags", raw)}
				onRemove={(tag) => remove("neverUseHashtags", tag)}
			/>
		</section>
	);
}

function TagList({
	label,
	helper,
	tags,
	onAdd,
	onRemove,
}: {
	label: string;
	helper: string;
	tags: string[];
	onAdd: (raw: string) => void;
	onRemove: (tag: string) => void;
}) {
	const inputId = useId();
	const [draft, setDraft] = useState("");
	const full = tags.length >= MAX_HASHTAG_RULES_PER_LIST;

	const commit = () => {
		if (!draft.trim()) return;
		onAdd(draft);
		setDraft("");
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			commit();
		}
	};

	return (
		<div className="space-y-2">
			<label htmlFor={inputId} className="text-xs font-medium block">
				{label}
			</label>

			<div className="flex flex-wrap gap-1.5">
				{tags.length === 0 && (
					<span className="text-[11px] text-muted-foreground italic">None</span>
				)}
				{tags.map((tag) => (
					<span
						key={tag}
						className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-full bg-primary/10 text-primary border border-primary/20"
					>
						<span className="font-mono">#{tag}</span>
						<button
							type="button"
							onClick={() => onRemove(tag)}
							aria-label={`Remove #${tag}`}
							className="hover:text-destructive"
						>
							<XIcon aria-hidden className="w-3 h-3" />
						</button>
					</span>
				))}
			</div>

			<div className="flex gap-1.5">
				<Input
					id={inputId}
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					onKeyDown={handleKeyDown}
					onBlur={commit}
					placeholder={full ? "Remove one to add more" : "Type a tag + Enter"}
					disabled={full}
					spellCheck={false}
					className="h-8 text-xs"
				/>
			</div>

			<p className={cn("text-[10px] text-muted-foreground")}>{helper}</p>
		</div>
	);
}
