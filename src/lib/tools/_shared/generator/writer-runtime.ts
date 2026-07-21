import type { PostPlatformType, PostToneType } from "@/lib/constants";
import type {
	ArticleInputType,
	PostHistoryType,
	PostDraftType,
	PostStyleTemplateType,
	PostDraftsResultType,
	TokenUsageType,
	PostStyleType,
} from "@/lib/types";
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
	input: ArticleInputType;
	platforms: PostPlatformType[];
	xThreadLength: number;
	style: PostStyleType;
	googleApiKey?: string;
	googleModel?: string;
} & GenerateExtras;

export type RegenerateParams = {
	input: ArticleInputType;
	platform: PostPlatformType;
	xThreadLength: number;
	style: PostStyleType;
	googleApiKey?: string;
	googleModel?: string;
} & GenerateExtras;

export type GenerateResult =
	| { ok: true; data: PostDraftsResultType; remaining: number | null }
	| { ok: false; error: string };

export type RegenerateResult =
	| {
			ok: true;
			draft: PostDraftType;
			usage: TokenUsageType;
			remaining: number | null;
	  }
	| { ok: false; error: string };

export type StyleTemplatesApi = {
	templates: PostStyleTemplateType[];
	activeId: string | null;
	save: (name: string) => void;
	apply: (t: PostStyleTemplateType) => void;
	remove: (id: string) => void;
	update: (id: string) => void;
	rename: (id: string, name: string) => void;
};

export type HistoryApi = {
	history: PostHistoryType[];
	upsert: (entry: Omit<PostHistoryType, "id"> & { id?: string }) => void;
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
		styleStorage: Store<PostStyleType>;
		workflowStorage: Store<WorkflowStateType>;
		setTone: (tone: PostToneType) => void;
		togglePlatform: (platform: PostPlatformType) => void;
		setXThreadLength: (n: number) => void;
	};
	useStyleTemplates: () => StyleTemplatesApi;
	useHistory: () => HistoryApi;
	onGenerate: (params: GenerateParams) => Promise<GenerateResult>;
	onRegenerate: (params: RegenerateParams) => Promise<RegenerateResult>;
};
