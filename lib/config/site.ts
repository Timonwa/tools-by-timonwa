/**
 * Single source of truth for the hub's identity, creator, and every off-site
 * link. Registered once here and imported everywhere (metadata, JSON-LD, OG
 * images, navbar, footer) — change a value here to update the whole site.
 */

/** Canonical hub URL and display name. */
export const SITE_URL = "https://tools.timonwa.com";
export const SITE_DOMAIN = SITE_URL.replace(/^https?:\/\//, "");
export const SITE_NAME = "Tools by Timonwa";

/** Creator / author — referenced from metadata, JSON-LD, and the footer. */
export const CREATOR_NAME = "Timonwa";
/** Link hub (linktree-style) for the creator. */
export const CREATOR_URL = "https://links.timonwa.com";
/** Twitter/X handle (used in Twitter card metadata). */
export const CREATOR_TWITTER = "@timonwa_";

/** Creator's public profiles — used for JSON-LD `sameAs`. Derived from the
 * handle so there's a single place to change it. */
export const CREATOR_TWITTER_URL = `https://x.com/${CREATOR_TWITTER.slice(1)}`;
export const CREATOR_SITE_URL = "https://tech.timonwa.com";
export const CREATOR_SAME_AS = [CREATOR_TWITTER_URL, CREATOR_SITE_URL];

/** GitHub repo — Navbar star button, Footer license + repo links, tool JSON-LD. */
export const REPO_URL = "https://github.com/Timonwa/tools-by-timonwa";
export const LICENSE_URL = `${REPO_URL}/blob/main/LICENSE`;

/** Support / sponsor link (Navbar). */
export const SPONSOR_URL = "https://buymeacoffee.com/timonwa";

/** Legal pages, hosted on the main site (Footer). */
export const TERMS_URL = "https://tech.timonwa.com/terms";
export const PRIVACY_URL = "https://tech.timonwa.com/privacy";
