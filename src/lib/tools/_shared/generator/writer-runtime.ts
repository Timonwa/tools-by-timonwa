import type { HistoryEntryType } from "@/lib/tools/_shared/generator/types";
import type {
	DraftInputType,
	PlatformType,
	PostDraftType,
	PresetTemplateType,
	PreviewResultType,
	ToneType,
	TokenUsageType,
	WritingPreferencesType,
} from "@/lib/tools/_shared/generator/types";
import type { WorkflowStateType } from "./storage";

type Store<T> = {
	get: () => T;
	set: (value: T) => void;
	subscribe: (cb: () => void) => () => void;
	getSnapshot: () => T;
	getServerSnapshot: () => T;
};

/** Extras a tool may add to a generation request (populated by conditional form controls). */
export type GenerateExtras = {
	prompt?: string;
	variantCount?: number;
};

export type GenerateParams = {
	input: DraftInputType;
	tone: ToneType;
	platforms: PlatformType[];
	xThreadLength: number;
	preferences: WritingPreferencesType;
	googleApiKey?: string;
	googleModel?: string;
} & GenerateExtras;

export type RegenerateParams = {
	input: DraftInputType;
	platform: PlatformType;
	tone: ToneType;
	xThreadLength: number;
	preferences: WritingPreferencesType;
	googleApiKey?: string;
	googleModel?: string;
} & GenerateExtras;

export type GenerateResult =
	| { ok: true; data: PreviewResultType; remaining: number | null }
	| { ok: false; error: string };

export type RegenerateResult =
	| {
			ok: true;
			draft: PostDraftType;
			usage: TokenUsageType;
			remaining: number | null;
	  }
	| { ok: false; error: string };

export type PresetsApi = {
	templates: PresetTemplateType[];
	activeId: string | null;
	save: (name: string) => void;
	apply: (t: PresetTemplateType) => void;
	remove: (id: string) => void;
	update: (id: string) => void;
	rename: (id: string, name: string) => void;
};

export type HistoryApi = {
	history: HistoryEntryType[];
	upsert: (entry: Omit<HistoryEntryType, "id"> & { id?: string }) => void;
	remove: (id: string) => void;
};

/** Which conditional writer features a tool turns on. */
export type GeneratorFeatures = {
	hashtagRules: boolean;
	promptEditor: boolean;
	repurpose: boolean;
};

/** Everything the shared writer engine needs from a specific tool — injected so one engine can power several tools with isolated storage, actions, and features. */
export type WriterRuntime = {
	features: GeneratorFeatures;
	stores: {
		prefsStorage: Store<WritingPreferencesType>;
		workflowStorage: Store<WorkflowStateType>;
		setTone: (tone: ToneType) => void;
		togglePlatform: (platform: PlatformType) => void;
		setXThreadLength: (n: number) => void;
	};
	usePresets: () => PresetsApi;
	useHistory: () => HistoryApi;
	onGenerate: (params: GenerateParams) => Promise<GenerateResult>;
	onRegenerate: (params: RegenerateParams) => Promise<RegenerateResult>;
};
