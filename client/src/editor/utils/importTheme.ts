import { Theme, SectionData } from "../mockTheme";

/**
 * Restores and normalizes a theme object from a JSON string or object.
 * Ensures that all required fields (blocks, block_order, etc.) are present.
 */
export const importTheme = (json: string | any): Theme => {
  const data = typeof json === "string" ? JSON.parse(json) : json;

  const normalizedTheme: Theme = {
    schemaVersion: data.schemaVersion || 1,
    templates: {
      home: {
        sections: {},
        order: data.templates?.home?.order || [],
      },
    },
  };

  const sourceSections = data.templates?.home?.sections || {};

  Object.keys(sourceSections).forEach((id) => {
    const s = sourceSections[id];
    normalizedTheme.templates.home.sections[id] = {
      id: s.id || id,
      type: s.type,
      settings: s.settings || {},
      blocks: s.blocks || {},
      block_order: s.block_order || [],
    };
  });

  return normalizedTheme;
};
