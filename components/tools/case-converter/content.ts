import type { ToolContentType } from "@/components/_shared/ToolContent";

export const caseConverterContent: ToolContentType = {
	sections: [
		{
			heading: "What is a case converter?",
			body: [
				"A case converter is a free tool that instantly changes the capitalization of your text — from UPPERCASE to lowercase, into Title Case or Sentence case, or into programming styles like camelCase, snake_case, and kebab-case. Instead of retyping a heading or hand-fixing a variable name, you paste your text, pick a style, and copy the result. It's built for writers and editors formatting titles and headlines, and for developers renaming variables, files, and constants.",
				"This converter offers 17 styles across three groups — writing, programming, and special — and runs entirely in your browser. Your text is never uploaded or stored; every conversion happens on your own device.",
			],
		},
		{
			heading: "Who is the case converter for?",
			body: [
				"The case converter helps two main groups. Writers, editors, and students use it to format headlines and titles to a style guide, fix text that arrived in ALL CAPS, or switch a heading to sentence case. Developers use it constantly to rename things — turning a plain phrase into a camelCase variable, a PascalCase component, a snake_case column, a kebab-case filename, or a CONSTANT_CASE config key without reaching for the shift key. Anyone who moves text between tools that expect different casing will save time here.",
			],
		},
		{
			heading: "How to use the case converter",
			body: [
				"Type or paste your text into the box, then choose a style. The result appears immediately with a one-click copy button — there's nothing to press to convert and no sign-up. Switch between styles as often as you like; your original text stays in the input box, so you can try several formats before copying the one you need.",
			],
		},
		{
			heading: "Writing case styles explained",
			body: [
				"UPPERCASE makes every letter capital and lowercase makes every letter small. Sentence case capitalizes only the first letter of each sentence, the way ordinary prose is written. Start Case capitalizes the first letter of every word, which is handy for labels and buttons.",
				'Title Case is more nuanced, because style guides disagree on the rules. This tool includes three standards: AP (Associated Press, used in news) lowercases prepositions of three letters or fewer; Chicago (used in books and publishing) lowercases all prepositions regardless of length; and APA (used in academic papers) capitalizes any word of four letters or more. On a short title they can look identical — the differences show up on words like "with," "from," and trailing short words.',
			],
		},
		{
			heading: "Programming case styles explained",
			body: [
				"Programming languages and file systems each favor a convention. camelCase (myVariableName) is common for JavaScript variables and functions; PascalCase (MyClassName) for classes and React components; snake_case (my_variable) for Python and Ruby; kebab-case (my-file-name) for URLs, CSS classes, and filenames; CONSTANT_CASE (MY_CONSTANT) for constants and environment variables; dot.case (my.property) for config keys and object paths; path/case (my/folder/file) for file paths; and Train-Case (My-Header-Name) for HTTP headers. Converting between them lets you paste a phrase and get a correctly formatted identifier without touching the shift key.",
			],
		},
	],
	faq: [
		{
			question: "How do I change text from uppercase to lowercase?",
			answer:
				"Paste your text, choose the lowercase style, and copy the result. You can switch to UPPERCASE or any other style at any time — your original text stays in the input box.",
		},
		{
			question: "What is title case?",
			answer:
				"Title case capitalizes the important words in a heading while leaving minor words like articles and short prepositions lowercase. The exact rules depend on the style guide, so this tool offers AP, Chicago, and APA versions.",
		},
		{
			question:
				"What is the difference between AP, Chicago, and APA title case?",
			answer:
				"AP lowercases prepositions of three letters or fewer and capitalizes longer ones; Chicago lowercases all prepositions regardless of length; APA capitalizes any word with four or more letters. They only differ on certain words, so short titles can look the same in all three.",
		},
		{
			question: "What are camelCase, snake_case, and kebab-case?",
			answer:
				"They're naming conventions used in code. camelCase (myVariable) suits JavaScript variables, snake_case (my_variable) suits Python and Ruby, and kebab-case (my-file) suits URLs, CSS classes, and filenames.",
		},
		{
			question: "How do I capitalize the first letter of every word?",
			answer:
				"Use Start Case, which capitalizes the first letter of each word. If you want a headline that follows a style guide's rules for minor words, use one of the Title Case options instead.",
		},
		{
			question: "What is sentence case?",
			answer:
				"Sentence case capitalizes only the first letter of each sentence and leaves the rest lowercase, the way normal sentences are written. It's the standard for body text and, increasingly, for UI labels and headings.",
		},
		{
			question: "Does the case converter change my original text?",
			answer:
				"No. The converter shows the result in a separate output box and copies only what you choose, so your input stays untouched. Everything runs in your browser — nothing is uploaded or saved.",
		},
		{
			question: "What is Train-Case, or HTTP header case?",
			answer:
				"Train-Case capitalizes each word and joins them with hyphens, like Content-Type or X-Frame-Options. It's the convention used for HTTP header names.",
		},
	],
};
