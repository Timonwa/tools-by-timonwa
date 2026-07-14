import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import jsxA11y from "eslint-plugin-jsx-a11y";

const eslintConfig = defineConfig([
	...nextVitals,
	...nextTs,
	// eslint-config-next already registers the jsx-a11y plugin; enable its full
	// recommended ruleset (broader than next's subset) without redefining the
	// plugin. This is the a11y static gate — keep it on in CI so regressions can't merge.
	{ rules: { ...jsxA11y.flatConfigs.recommended.rules } },
	// Intentional, reviewed autofocus exceptions. TemplatesPicker focuses a rename
	// field revealed on click (focus management for a control shown on user action).
	// The slug generator focuses its single-line input — short and type-oriented, so
	// the mobile-keyboard pop is minimal, unlike the paste-oriented textarea tools
	// (word counter, reading time, case converter) which keep autofocus off.
	{
		files: [
			"components/tools/article-to-social-posts/writer/TemplatesPicker.tsx",
			"components/tools/slug-generator/SlugGeneratorTool.tsx",
		],
		rules: { "jsx-a11y/no-autofocus": "off" },
	},
	// Disable ESLint rules that conflict with Prettier (must come last).
	prettier,
	// Override default ignores of eslint-config-next.
	globalIgnores([
		// Default ignores of eslint-config-next:
		".next/**",
		"out/**",
		"build/**",
		"next-env.d.ts",
	]),
]);

export default eslintConfig;
