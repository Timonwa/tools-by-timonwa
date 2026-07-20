export type DraftInputType =
	{ kind: "url"; url: string } | { kind: "text"; text: string };

export type InputKindType = DraftInputType["kind"];
