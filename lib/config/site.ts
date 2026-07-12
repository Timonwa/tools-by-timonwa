/**
 * Canonical hub URL and display name. Every piece of metadata, JSON-LD, and
 * OG image text derives from these — change here to move the whole hub to a
 * new domain.
 */
export const SITE_URL = "https://tools.timonwa.com";
export const SITE_DOMAIN = SITE_URL.replace(/^https?:\/\//, "");
export const SITE_NAME = "Tools by Timonwa";

/** Creator / author — referenced from metadata, JSON-LD, and the footer. */
export const CREATOR_NAME = "Timonwa";
export const CREATOR_URL = "https://links.timonwa.com";
export const CREATOR_TWITTER = "@timonwa_";

/** GitHub repo — referenced from Navbar star button, Footer license + repo links, and tool JSON-LD. */
export const REPO_URL = "https://github.com/Timonwa/tools-by-timonwa";
export const LICENSE_URL = `${REPO_URL}/blob/main/LICENSE`;
