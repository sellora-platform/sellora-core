import { Theme, mockTheme } from "../mockTheme";

export interface EditorEvent {
  type: string;
  payload?: any;
  timestamp: number;
  sectionId?: string;
  blockId?: string;
}

/**
 * Reconstructs the theme state by applying a series of granular events.
 * This is the core of our event-driven architecture.
 */
export const rebuildThemeFromEvents = (initialTheme: Theme, events: EditorEvent[]): Theme => {
  const theme = structuredClone(initialTheme);

  events.forEach((event) => {
    switch (event.type) {
      case "SECTION_ADDED":
        theme.templates.home.sections[event.payload.id] = event.payload;
        theme.templates.home.order.push(event.payload.id);
        break;

      case "SECTION_UPDATED":
        if (theme.templates.home.sections[event.sectionId!]) {
          theme.templates.home.sections[event.sectionId!].settings = {
            ...theme.templates.home.sections[event.sectionId!].settings,
            ...event.payload,
          };
        }
        break;

      case "SECTION_DELETED":
        delete theme.templates.home.sections[event.sectionId!];
        theme.templates.home.order = theme.templates.home.order.filter(id => id !== event.sectionId);
        break;

      case "SECTION_REORDERED":
        theme.templates.home.order = event.payload;
        break;

      case "BLOCK_ADDED":
        const section = theme.templates.home.sections[event.sectionId!];
        if (section) {
          if (!section.blocks) section.blocks = {};
          if (!section.block_order) section.block_order = [];
          section.blocks[event.payload.id] = event.payload;
          section.block_order.push(event.payload.id);
        }
        break;

      case "BLOCK_UPDATED":
        const bSection = theme.templates.home.sections[event.sectionId!];
        if (bSection && bSection.blocks?.[event.blockId!]) {
          bSection.blocks[event.blockId!].settings = {
            ...bSection.blocks[event.blockId!].settings,
            ...event.payload,
          };
        }
        break;

      case "BLOCK_DELETED":
        const dSection = theme.templates.home.sections[event.sectionId!];
        if (dSection && dSection.blocks) {
          delete dSection.blocks[event.blockId!];
          dSection.block_order = dSection.block_order.filter(id => id !== event.blockId);
        }
        break;

      case "BLOCK_REORDERED":
        const rSection = theme.templates.home.sections[event.sectionId!];
        if (rSection) {
          rSection.block_order = event.payload;
        }
        break;
    }
  });

  return theme;
};
