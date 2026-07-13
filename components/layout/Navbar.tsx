import type { Route } from "next";
import { CoffeeIcon } from "lucide-react";
import Link from "next/link";
import type { ComponentType, ReactNode, SVGProps } from "react";

import { buttonClasses } from "@/components/ui";
import ByokDrawer from "@/components/_shared/byok/ByokDrawer";
import ToolsMenu from "@/components/layout/ToolsMenu";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { REPO_URL, SPONSOR_URL } from "@/lib/config/site";

type IconComponentType = ComponentType<SVGProps<SVGSVGElement>>;

type NavbarProps = {
	brand: {
		href: Route;
		name: string;
		icon: IconComponentType;
		ariaLabel?: string;
	};
	/** Rendered between brand and right-side actions. Typically tool-specific (e.g. usage notice). */
	centerSlot?: ReactNode;
	/** Rendered in the right-side cluster, between ThemeToggle and the Sponsor/GitHub links. Typically tool-specific (e.g. settings drawer). */
	actionsSlot?: ReactNode;
	/** GitHub repo URL for the "Star on GitHub" button. Defaults to the hub repo. */
	repoUrl?: string;
};

export default function Navbar({
	brand,
	centerSlot,
	actionsSlot,
	repoUrl = REPO_URL,
}: NavbarProps) {
	const BrandIcon = brand.icon;
	return (
		<nav
			aria-label="Primary"
			className="flex items-center justify-between px-6 sm:px-10 py-4 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-40"
		>
			<Link
				href={brand.href}
				aria-label={brand.ariaLabel ?? `${brand.name} home`}
				className="flex min-w-0 items-center gap-2 pr-2 font-semibold text-lg"
			>
				<span
					aria-hidden
					className="flex shrink-0 items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary"
				>
					<BrandIcon className="w-5 h-5" />
				</span>
				<span className="truncate sm:whitespace-normal">{brand.name}</span>
			</Link>

			{centerSlot}

			<div className="flex items-center gap-1 sm:gap-2">
				<ToolsMenu />
				<ThemeToggle />
				<ByokDrawer />
				{actionsSlot}
				<a
					href={SPONSOR_URL}
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Support on Buy Me a Coffee"
					className={buttonClasses({ variant: "outline", size: "sm" })}
				>
					<CoffeeIcon aria-hidden className="w-4 h-4" />
					<span className="hidden sm:inline">Sponsor</span>
				</a>
				<a
					href={repoUrl}
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Star on GitHub"
					className={buttonClasses({ variant: "outline", size: "sm" })}
				>
					<span aria-hidden>⭐</span>
					<span className="hidden sm:inline">Star on GitHub</span>
				</a>
			</div>
		</nav>
	);
}
