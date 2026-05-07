export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Returns the login page URL.
 * Sellora uses its own auth pages instead of external OAuth.
 */
export const getLoginUrl = () => "/login";
