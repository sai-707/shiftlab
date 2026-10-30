// The public address of the site, used for link previews, the sitemap and robots.txt.
// shortcut: hard-coded to the workers.dev address. Change it here when a custom domain is added.
export const SITE_URL = "https://shiftlab.blueteam-labs.workers.dev";

// Where the "Send feedback" links go. Paste the Google Form link into FEEDBACK_URL when it exists.
// Until then the links open an email to the owner (the same address as the privacy page).
export const FEEDBACK_URL = "";
export const FEEDBACK_HREF = FEEDBACK_URL || "mailto:saidaswadkar14@gmail.com?subject=ShiftLab%20feedback";
