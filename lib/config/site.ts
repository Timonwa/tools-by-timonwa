/**
 * Hub identity, creator, and off-site links — imported everywhere (metadata,
 * JSON-LD, OG images, navbar, footer). Edit here to change the whole site.
 */

/** Canonical hub URL and display name. */
export const SITE_URL = "https://tools.timonwa.com";
export const SITE_DOMAIN = SITE_URL.replace(/^https?:\/\//, "");
export const SITE_NAME = "Tools by Timonwa";
export const SITE_TITLE = `${SITE_NAME} — Small, focused, open-source tools`;
export const SITE_DESCRIPTION =
	"A growing collection of focused, open-source tools by Timonwa — one home for small software that does one thing well.";

/** Creator / author — referenced from metadata, JSON-LD, and the footer. */
export const CREATOR_NAME = "Timonwa Akintokun";
/** Link hub (linktree-style) for the creator. */
export const CREATOR_URL = "https://links.timonwa.com";
/** Twitter/X handle (used in Twitter card metadata). */
export const CREATOR_TWITTER = "@timonwa_";

/** Creator's public profiles — used for JSON-LD `sameAs`. Derived from the
 * handle so there's a single place to change it. */
export const CREATOR_TWITTER_URL = `https://x.com/${CREATOR_TWITTER.slice(1)}`;
export const CREATOR_SITE_URL = "https://tech.timonwa.com";
/** The creator's blog — the footer "Blog" link points here, not the site root. */
export const CREATOR_BLOG_URL = `${CREATOR_SITE_URL}/blog`;
export const CREATOR_SAME_AS = [CREATOR_TWITTER_URL, CREATOR_SITE_URL];

/** GitHub repo — Navbar star button, Footer license + repo links, tool JSON-LD. */
export const REPO_URL = "https://github.com/Timonwa/tools-by-timonwa";
export const LICENSE_URL = `${REPO_URL}/blob/main/LICENSE`;

/** Support / support link (Navbar). */
export const SUPPORT_URL = "https://tech.timonwa.com/support";

/** Legal pages, hosted on the main site (Footer). */
export const TERMS_URL = "https://tech.timonwa.com/terms";
export const PRIVACY_URL = "https://tech.timonwa.com/privacy";

/** Google AI Studio — where users create a free Gemini API key for BYOK. */
export const AI_STUDIO_URL = "https://aistudio.google.com";
export const AI_STUDIO_KEYS_URL = `${AI_STUDIO_URL}/api-keys`;
