/**
 * Text case transforms. Whole-text cases (upper/lower/title/sentence/
 * alternating/inverse) preserve punctuation and spacing; programmer cases
 * (camel/pascal/snake/kebab/constant/dot) tokenize the text into words first.
 */

export type CaseIdType =
	| "upper"
	| "lower"
	| "title"
	| "sentence"
	| "camel"
	| "pascal"
	| "snake"
	| "kebab"
	| "constant"
	| "dot"
	| "alternating"
	| "inverse";

const tokens = (input: string): string[] =>
	input
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2") // split camelCase boundaries
		.replace(/[_\-.]+/g, " ")
		.replace(/\s+/g, " ")
		.trim()
		.split(" ")
		.filter(Boolean);

const cap = (w: string): string =>
	w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w;

const TRANSFORMS: Record<CaseIdType, (text: string) => string> = {
	upper: (t) => t.toUpperCase(),
	lower: (t) => t.toLowerCase(),
	title: (t) => t.replace(/\p{L}[\p{L}\p{M}']*/gu, cap),
	sentence: (t) =>
		t
			.toLowerCase()
			.replace(/(^\s*\p{L})|([.!?…]\s+\p{L})/gu, (m) => m.toUpperCase()),
	camel: (t) =>
		tokens(t)
			.map((w, i) => (i === 0 ? w.toLowerCase() : cap(w)))
			.join(""),
	pascal: (t) => tokens(t).map(cap).join(""),
	snake: (t) =>
		tokens(t)
			.map((w) => w.toLowerCase())
			.join("_"),
	kebab: (t) =>
		tokens(t)
			.map((w) => w.toLowerCase())
			.join("-"),
	constant: (t) =>
		tokens(t)
			.map((w) => w.toUpperCase())
			.join("_"),
	dot: (t) =>
		tokens(t)
			.map((w) => w.toLowerCase())
			.join("."),
	alternating: (t) => {
		let i = 0;
		return t.replace(/\p{L}/gu, (ch) =>
			i++ % 2 === 0 ? ch.toLowerCase() : ch.toUpperCase(),
		);
	},
	inverse: (t) =>
		t.replace(/\p{L}/gu, (ch) =>
			ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase(),
		),
};

export type CaseOptionType = { id: CaseIdType; label: string; example: string };

export const CASES: CaseOptionType[] = [
	{ id: "upper", label: "UPPERCASE", example: "HELLO WORLD" },
	{ id: "lower", label: "lowercase", example: "hello world" },
	{ id: "title", label: "Title Case", example: "Hello World" },
	{ id: "sentence", label: "Sentence case", example: "Hello world" },
	{ id: "camel", label: "camelCase", example: "helloWorld" },
	{ id: "pascal", label: "PascalCase", example: "HelloWorld" },
	{ id: "snake", label: "snake_case", example: "hello_world" },
	{ id: "kebab", label: "kebab-case", example: "hello-world" },
	{ id: "constant", label: "CONSTANT_CASE", example: "HELLO_WORLD" },
	{ id: "dot", label: "dot.case", example: "hello.world" },
	{ id: "alternating", label: "aLtErNaTiNg", example: "hElLo wOrLd" },
	{ id: "inverse", label: "InVeRsE cAsE", example: "iNVERSE cASE" },
];

export const convertCase = (text: string, id: CaseIdType): string =>
	TRANSFORMS[id](text);
