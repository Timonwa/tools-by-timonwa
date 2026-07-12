"use client";

import { Monitor, Moon, Sun } from "lucide-react";

import { type ThemeType, useTheme } from "@/components/theme/use-theme";

const OPTIONS: { value: ThemeType; label: string; Icon: typeof Sun }[] = [
	{ value: "light", label: "Light", Icon: Sun },
	{ value: "dark", label: "Dark", Icon: Moon },
	{ value: "system", label: "System", Icon: Monitor },
];

export default function ThemePicker() {
	const { theme, setTheme } = useTheme();
	return (
		<fieldset
			aria-label="Theme"
			className="grid grid-cols-3 gap-1.5 border-0 p-0 m-0 min-w-0"
		>
			{OPTIONS.map(({ value, label, Icon }) => (
				<button
					key={value}
					type="button"
					aria-pressed={theme === value}
					onClick={() => setTheme(value)}
					className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md border text-xs transition-colors ${
						theme === value
							? "border-primary bg-primary/10 ring-2 ring-primary"
							: "border-border bg-background hover:bg-accent"
					}`}
				>
					<Icon aria-hidden className="w-3.5 h-3.5" />
					{label}
				</button>
			))}
		</fieldset>
	);
}
