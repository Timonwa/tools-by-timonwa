/**
 * Framework-agnostic text metrics. Shared by the deterministic text tools
 * (Word & Character Counter, Reading Time) so every tool counts the same way.
 * Character counts iterate code points (`[...text]`) so emoji and accented
 * letters count as one, matching what most online counters report.
 */

export type TextCountsType = {
	characters: number;
	charactersNoSpaces: number;
	words: number;
	sentences: number;
	paragraphs: number;
	lines: number;
};

const codePoints = (text: string): number => [...text].length;

export const countWords = (text: string): number => {
	const trimmed = text.trim();
	return trimmed ? trimmed.split(/\s+/).length : 0;
};

export const countCharacters = (text: string): number => codePoints(text);

export const countCharactersNoSpaces = (text: string): number =>
	codePoints(text.replace(/\s/gu, ""));

export const countSentences = (text: string): number =>
	text
		.split(/[.!?…]+/u)
		.map((s) => s.trim())
		.filter(Boolean).length;

export const countParagraphs = (text: string): number =>
	text
		.split(/\n\s*\n/)
		.map((p) => p.trim())
		.filter(Boolean).length;

export const countLines = (text: string): number =>
	text ? text.split(/\r\n|\r|\n/).length : 0;

export const getTextCounts = (text: string): TextCountsType => ({
	characters: countCharacters(text),
	charactersNoSpaces: countCharactersNoSpaces(text),
	words: countWords(text),
	sentences: countSentences(text),
	paragraphs: countParagraphs(text),
	lines: countLines(text),
});
