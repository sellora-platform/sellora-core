import { Theme } from "../mockTheme";

/**
 * Cleanly exports the theme state into a serializable JSON object.
 * Removes any UI-only state and ensures data integrity.
 */
export const exportTheme = (theme: Theme): string => {
  const exportData = {
    schemaVersion: theme.schemaVersion || 1,
    templates: theme.templates,
  };

  return JSON.stringify(exportData, null, 2);
};
