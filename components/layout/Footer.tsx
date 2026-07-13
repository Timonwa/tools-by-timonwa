import { HeartIcon, WrenchIcon } from "lucide-react";

import GithubMark from "@/components/ui/GithubMark";
import {
	CREATOR_NAME,
	CREATOR_URL,
	LICENSE_URL,
	PRIVACY_URL,
	REPO_URL,
	SITE_NAME,
	TERMS_URL,
} from "@/lib/config/site";

const LEGAL_LINKS = [
	{ href: LICENSE_URL, label: "MIT License" },
	{ href: TERMS_URL, label: "Terms" },
	{ href: PRIVACY_URL, label: "Privacy" },
];

// Resolved at build/module load (not during render) so it stays static under
// Cache Components — the copyright year doesn't need request-time freshness.
const YEAR = new Date().getFullYear();

export default function Footer() {
	return (
		<footer className="border-t border-border/50 bg-background/50">
			<div className="container mx-auto px-4 sm:px-10 py-6 max-w-6xl space-y-4">
				<div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
					<div className="flex items-start gap-2.5 text-muted-foreground justify-center sm:justify-start min-w-0">
						<WrenchIcon
							aria-hidden
							className="w-4 h-4 mt-0.5 text-primary shrink-0"
						/>
						<span className="min-w-0 text-center sm:text-left leading-snug">
							<span className="font-semibold text-foreground">{SITE_NAME}</span>{" "}
							· Open source
						</span>
					</div>

					<div className="flex items-center gap-5 text-muted-foreground flex-wrap justify-center sm:justify-end">
						<span className="inline-flex items-center gap-1.5 flex-wrap">
							<HeartIcon className="w-3.5 h-3.5 text-primary" />
							Built by{" "}
							<a
								href={CREATOR_URL}
								target="_blank"
								rel="noopener noreferrer"
								className="font-medium text-foreground hover:text-primary transition-colors"
							>
								{CREATOR_NAME}
							</a>
						</span>

						<a
							href={REPO_URL}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
						>
							<GithubMark aria-hidden className="w-3.5 h-3.5" />
							GitHub
						</a>
					</div>
				</div>

				<div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 border-t border-border/40 pt-3 text-[11px] text-muted-foreground">
					{LEGAL_LINKS.map((link) => (
						<span key={link.href} className="inline-flex items-center gap-x-3">
							<a
								href={link.href}
								target="_blank"
								rel="noopener noreferrer"
								className="hover:text-foreground hover:underline underline-offset-2 transition-colors"
							>
								{link.label}
							</a>
							<span aria-hidden className="opacity-50">
								·
							</span>
						</span>
					))}
					<span>
						© {YEAR} {CREATOR_NAME}
					</span>
				</div>
			</div>
		</footer>
	);
}
