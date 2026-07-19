import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import jsxA11y from "eslint-plugin-jsx-a11y";

const eslintConfig = defineConfig([
	...nextVitals,
	...nextTs,
	// Full jsx-a11y recommended set (broader than next's subset) as the CI a11y gate.
	{ rules: { ...jsxA11y.flatConfigs.recommended.rules } },
	// Reviewed autofocus exceptions: a rename field revealed on click, and the slug
	// generator's short single-line input. Paste-oriented textarea tools keep it off.
	{
		files: [
			"components/tools/article-to-social-posts/writer/TemplatesPicker.tsx",
			"components/tools/slug-generator/SlugGeneratorTool.tsx",
		],
		rules: { "jsx-a11y/no-autofocus": "off" },
	},
	// Must come last: disables rules that conflict with Prettier.
	prettier,
	globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
