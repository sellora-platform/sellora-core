import { Theme } from "../mockTheme";

export interface EditorEvent {
  eventId: string;
  themeId: string;
  clientId: string;
  type: string;
  payload?: any;
  timestamp: number;
  sectionId?: string;
  blockId?: string;
}

/**
 * Projects a single section's state from a list of events.
 * Only applies events that affect this specific sectionId.
 */
export const projectSection = (initialSection: any, sectionId: string, events: EditorEvent[]): any => {
  const section = initialSection ? structuredClone(initialSection) : null;
  if (!section && !events.some(e => e.type === "SECTION_ADDED" && e.payload.id === sectionId)) return null;

  let currentSection = section;

  events.forEach((event) => {
    // Only apply if it affects this section
    if (event.sectionId !== sectionId && !(event.type === "SECTION_ADDED" && event.payload.id === sectionId)) {
      return;
    }

    switch (event.type) {
      case "SECTION_ADDED":
        currentSection = structuredClone(event.payload);
        break;

      case "SECTION_UPDATED":
        if (currentSection) {
          currentSection.settings = { ...currentSection.settings, ...event.payload };
        }
        break;

      case "BLOCK_ADDED":
        if (currentSection) {
          if (!currentSection.blocks) currentSection.blocks = {};
          if (!currentSection.block_order) currentSection.block_order = [];
          currentSection.blocks[event.payload.id] = event.payload;
          currentSection.block_order.push(event.payload.id);
        }
        break;

      case "BLOCK_REORDERED":
        if (currentSection) {
          currentSection.block_order = event.payload;
        }
        break;
        
      case "BLOCK_DELETED":
        if (currentSection && currentSection.blocks) {
          delete currentSection.blocks[event.blockId!];
          currentSection.block_order = currentSection.block_order.filter((id: string) => id !== event.blockId);
        }
        break;
    }
  });

  return currentSection;
};

/**
 * Projects a single block's state from a list of events.
 * Only applies events that affect this specific blockId inside a sectionId.
 */
export const projectBlock = (initialBlock: any, sectionId: string, blockId: string, events: EditorEvent[]): any => {
  const block = initialBlock ? structuredClone(initialBlock) : null;
  if (!block && !events.some(e => e.type === "BLOCK_ADDED" && e.payload.id === blockId)) return null;

  let currentBlock = block;

  events.forEach((event) => {
    if (event.sectionId !== sectionId || (event.blockId !== blockId && !(event.type === "BLOCK_ADDED" && event.payload.id === blockId))) {
      return;
    }

    switch (event.type) {
      case "BLOCK_ADDED":
        currentBlock = structuredClone(event.payload);
        break;

      case "BLOCK_UPDATED":
        if (currentBlock) {
          currentBlock.settings = { ...currentBlock.settings, ...event.payload };
        }
        break;
    }
  });

  return currentBlock;
};

/**
 * Reconstructs the full theme state (legacy/snapshot support)
 */
export const rebuildThemeFromEvents = (initialTheme: Theme, events: EditorEvent[], baseState?: any): Theme => {
  const theme = baseState ? structuredClone(baseState) : structuredClone(initialTheme);

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
        theme.templates.home.order = theme.templates.home.order.filter((id: string) => id !== event.sectionId);
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
          dSection.block_order = dSection.block_order.filter((id: string) => id !== event.blockId);
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
