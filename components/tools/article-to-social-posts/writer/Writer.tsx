"use client";

import { useEffect, useRef } from "react";
import { useWriter } from "@/components/tools/article-to-social-posts/hooks/use-writer";
import { Button } from "@/components/ui";
import ArticleCard from "./ArticleCard";
import DraftCard from "./DraftCard";
import GenerateForm from "./GenerateForm";
import HistorySidebar from "./HistorySidebar";

export default function Writer() {
	const w = useWriter();
	const resultsRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (w.preview) {
			resultsRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		}
	}, [w.preview]);

	return (
		<div className="grid gap-6 lg:grid-cols-[1fr_280px]">
			<div className="space-y-6 min-w-0">
				<GenerateForm
					inputKind={w.inputKind}
					onInputKindChange={w.setInputKind}
					url={w.url}
					onUrlChange={w.setUrl}
					text={w.text}
					onTextChange={w.setText}
					textReuse={w.textReuse}
					onToggleTextReuse={w.toggleTextReuse}
					urlReuse={w.urlReuse}
					onToggleUrlReuse={w.toggleUrlReuse}
					onClearDraft={w.clearDraft}
					tone={w.tone}
					onToneChange={w.setTone}
					platforms={w.platforms}
					onTogglePlatform={w.togglePlatform}
					xThreadLength={w.xThreadLength}
					onXThreadLengthChange={w.setXThreadLength}
					isGenerating={w.isGenerating}
					hasResult={Boolean(w.preview)}
					error={w.error}
					onSubmit={w.generate}
					templates={w.templates}
					activeTemplateId={w.activeTemplateId}
					onApplyTemplate={w.applyTemplate}
					onSaveTemplate={w.saveTemplate}
					onDeleteTemplate={w.deleteTemplate}
					onUpdateTemplate={w.updateTemplate}
					onRenameTemplate={w.renameTemplate}
				/>

				{w.preview && (
					<div ref={resultsRef} className="space-y-6">
						<ArticleCard
							article={w.preview.article}
							usage={w.lastUsage}
							copied={w.copiedKey === "all"}
							onCopyAll={w.copyAll}
						/>

						<div className="columns-1 md:columns-2 gap-4 space-y-4">
							{w.editableDrafts.map((draft) => (
								<DraftCard
									key={draft.platform}
									draft={draft}
									isRegenerating={!!w.regenerating[draft.platform]}
									copied={w.copiedKey === `draft-${draft.platform}`}
									onContentChange={(content) =>
										w.updateDraftContent(draft.platform, content)
									}
									onThreadPostChange={(index, content) =>
										w.updateThreadPost(draft.platform, index, content)
									}
									onCopy={() => w.copyDraft(draft)}
									onRegenerate={() => w.regenerate(draft)}
								/>
							))}
						</div>

						<Button
							onClick={w.clearAll}
							variant="outline"
							size="lg"
							className="w-full"
						>
							Start over with a new article
						</Button>
					</div>
				)}
			</div>

			<HistorySidebar
				entries={w.history}
				onLoad={w.loadFromHistory}
				onRemove={w.removeHistoryEntry}
			/>
		</div>
	);
}
