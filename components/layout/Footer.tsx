import { HeartIcon, WrenchIcon } from "lucide-react";
import Link from "next/link";

import { GithubMark } from "@/components/ui";
import {
	CREATOR_NAME,
	CREATOR_SITE_URL,
	CREATOR_TWITTER,
	CREATOR_TWITTER_URL,
	CREATOR_URL,
	LICENSE_URL,
	PRIVACY_URL,
	REPO_URL,
	SITE_DESCRIPTION,
	SITE_NAME,
	SPONSOR_URL,
	TERMS_URL,
} from "@/lib/config/site";
import { TOOLS } from "@/lib/config/tools";
import { ROUTES } from "@/lib/config/routes";
import { getAllGuides } from "@/lib/guides/loader";

const PROJECT_LINKS = [
	{ href: SPONSOR_URL, label: "Support" },
	{ href: REPO_URL, label: "Star on GitHub" },
	{ href: `${REPO_URL}/issues`, label: "Report an issue" },
	{ href: LICENSE_URL, label: "MIT License" },
];

const CONNECT_LINKS = [
	{ href: CREATOR_SITE_URL, label: "Blog" },
	{ href: CREATOR_URL, label: "All my links" },
	{ href: CREATOR_TWITTER_URL, label: `X (${CREATOR_TWITTER})` },
];

const LEGAL_LINKS = [
	{ href: TERMS_URL, label: "Terms" },
	{ href: PRIVACY_URL, label: "Privacy" },
];

// Resolved at module load (not during render) so it stays static under Cache
// Components — the copyright year doesn't need request-time freshness.
const YEAR = new Date().getFullYear();

const linkClass =
	"text-muted-foreground transition-colors hover:text-foreground";

function ExternalList({ links }: { links: { href: string; label: string }[] }) {
	return (
		<ul className="mt-3 space-y-2 text-sm">
			{links.map((link) => (
				<li key={link.href}>
					<a
						href={link.href}
						target="_blank"
						rel="noopener noreferrer"
						className={linkClass}
					>
						{link.label}
					</a>
				</li>
			))}
		</ul>
	);
}

export default function Footer() {
	const tools = TOOLS.filter((tool) => tool.status !== "soon");
	// Newest few guides, so the footer doesn't grow unbounded; "All guides" covers the rest.
	const guides = getAllGuides().slice(0, 5);

	return (
		<footer className="border-t border-border/50 bg-background/50">
			<div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
				<div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:grid-cols-12">
					{/* Brand */}
					<div className="col-span-2 sm:col-span-4 lg:col-span-4">
						<Link
							href={ROUTES.home}
							className="inline-flex items-center gap-2 text-base font-semibold"
						>
							<span
								aria-hidden
								className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"
							>
								<WrenchIcon className="h-5 w-5" />
							</span>
							{SITE_NAME}
						</Link>
						<p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
							{SITE_DESCRIPTION}
						</p>
						<div className="mt-4 flex items-center gap-2">
							<a
								href={SPONSOR_URL}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Support"
								className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
							>
								<HeartIcon aria-hidden className="h-4 w-4" />
							</a>
							<a
								href={REPO_URL}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Star on GitHub"
								className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
							>
								<GithubMark aria-hidden className="h-4 w-4" />
							</a>
						</div>
					</div>

					{/* Tools */}
					<nav aria-labelledby="footer-tools-heading" className="lg:col-span-2">
						<h2
							id="footer-tools-heading"
							className="text-sm font-semibold text-foreground"
						>
							Tools
						</h2>
						<ul className="mt-3 space-y-2 text-sm">
							{tools.map((tool) => (
								<li key={tool.slug}>
									<Link href={tool.href} className={linkClass}>
										{tool.name}
									</Link>
								</li>
							))}
						</ul>
					</nav>

					{/* Guides */}
					<nav
						aria-labelledby="footer-guides-heading"
						className="lg:col-span-2"
					>
						<h2
							id="footer-guides-heading"
							className="text-sm font-semibold text-foreground"
						>
							Guides
						</h2>
						<ul className="mt-3 space-y-2 text-sm">
							<li>
								<Link href={ROUTES.guides} className={linkClass}>
									All guides
								</Link>
							</li>
							{guides.map((guide) => (
								<li key={guide.slug}>
									<Link href={ROUTES.guide(guide.slug)} className={linkClass}>
										{guide.title}
									</Link>
								</li>
							))}
						</ul>
					</nav>

					{/* Project */}
					<nav
						aria-labelledby="footer-project-heading"
						className="lg:col-span-2"
					>
						<h2
							id="footer-project-heading"
							className="text-sm font-semibold text-foreground"
						>
							Project
						</h2>
						<ExternalList links={PROJECT_LINKS} />
					</nav>

					{/* More by the creator */}
					<nav
						aria-labelledby="footer-connect-heading"
						className="lg:col-span-2"
					>
						<h2
							id="footer-connect-heading"
							className="text-sm font-semibold text-foreground"
						>
							More by {CREATOR_NAME}
						</h2>
						<ExternalList links={CONNECT_LINKS} />
					</nav>
				</div>

				{/* Bottom bar */}
				<div className="mt-10 flex flex-col gap-3 border-t border-border/40 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
					<p>
						© {YEAR} {CREATOR_NAME} · {SITE_NAME} is open source under the MIT
						License.
					</p>
					<nav aria-label="Legal">
						<ul className="flex items-center gap-x-4">
							{LEGAL_LINKS.map((link) => (
								<li key={link.href}>
									<a
										href={link.href}
										target="_blank"
										rel="noopener noreferrer"
										className={linkClass}
									>
										{link.label}
									</a>
								</li>
							))}
						</ul>
					</nav>
				</div>
			</div>
		</footer>
	);
}
