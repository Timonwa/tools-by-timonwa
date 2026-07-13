"use client";

import { Monitor, Moon, Sun } from "lucide-react";

import Button from "@/components/ui/Button";
import { type ThemeType, useTheme } from "@/components/theme/use-theme";

const NEXT: Record<ThemeType, ThemeType> = {
	light: "dark",
	dark: "system",
	system: "light",
};

export default function ThemeToggle() {
	const { theme, resolvedTheme, setTheme } = useTheme();

	const Icon =
		theme === "system" ? Monitor : resolvedTheme === "dark" ? Moon : Sun;

	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={() => setTheme(NEXT[theme])}
			aria-label={`Theme: ${theme}. Cycle to ${NEXT[theme]}.`}
		>
			<Icon aria-hidden className="w-4 h-4" />
		</Button>
	);
}
