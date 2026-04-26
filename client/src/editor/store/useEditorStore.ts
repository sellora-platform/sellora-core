import { create } from "zustand";
import { Theme, mockTheme } from "../mockTheme";
import { SECTION_REGISTRY } from "../../sections/registry";
import { BLOCK_REGISTRY } from "../../blocks/registry";
import { trpcClient } from "../../lib/trpc-client";
import { importTheme } from "../utils/importTheme";

interface EditorState {
  theme: Theme;
  selectedSectionId: string | null;
  selectedBlockId: string | null;
  history: Theme[];
  historyIndex: number;
  isSaving: boolean;

  // Actions
  setTheme: (theme: Theme) => void;
  getThemeSnapshot: () => Theme;
  setSelectedSection: (id: string | null) => void;
  setSelectedBlock: (id: string | null) => void;
  updateSection: (sectionId: string, settings: any) => void;
  reorderSections: (newOrder: string[]) => void;
  addSection: (type: string) => void;
  deleteSection: (sectionId: string) => void;
  duplicateSection: (sectionId: string) => void;
  
  // Block Actions
  addBlock: (sectionId: string, type: string) => void;
  deleteBlock: (sectionId: string, blockId: string) => void;
  reorderBlocks: (sectionId: string, newOrder: string[]) => void;
  updateBlock: (sectionId: string, blockId: string, settings: any) => void;

  // Persistence Actions
  loadThemeFromServer: (storeId: number) => Promise<void>;
  saveThemeToServer: (storeId: number) => Promise<void>;
  publishTheme: (storeId: number) => Promise<void>;

  undo: () => void;
  redo: () => void;
}

const getDefaultsFromSchema = (schema: any) => {
  const defaults: Record<string, any> = {};
  if (schema.settings) {
    schema.settings.forEach((s: any) => {
      defaults[s.id] = s.default;
    });
  }
  return defaults;
};

// Debounce timer
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

export const useEditorStore = create<EditorState>((set, get) => ({
  theme: mockTheme,
  selectedSectionId: "hero-1",
  selectedBlockId: null,
  history: [structuredClone(mockTheme)],
  historyIndex: 0,
  isSaving: false,

  setTheme: (theme) => set({ theme }),
  
  getThemeSnapshot: () => {
    return structuredClone(get().theme);
  },
  
  setSelectedSection: (id) => set({ selectedSectionId: id, selectedBlockId: null }),
  
  setSelectedBlock: (id) => set({ selectedBlockId: id }),

  // Persistence Implementation
  loadThemeFromServer: async (storeId) => {
    try {
      const data = await trpcClient.themes.getTheme.query({ storeId });
      if (data && data.draftConfig) {
        const theme = importTheme(data.draftConfig);
        set({ 
          theme, 
          history: [structuredClone(theme)], 
          historyIndex: 0 
        });
      }
    } catch (error) {
      console.error("Failed to load theme:", error);
    }
  },

  saveThemeToServer: async (storeId) => {
    // Clear existing timeout
    if (saveTimeout) clearTimeout(saveTimeout);

    set({ isSaving: true });

    saveTimeout = setTimeout(async () => {
      try {
        const theme = get().getThemeSnapshot();
        await trpcClient.themes.saveTheme.mutate({
          storeId,
          themeJson: theme
        });
      } catch (error) {
        console.error("Failed to save theme:", error);
      } finally {
        set({ isSaving: false });
      }
    }, 500); // 500ms debounce
  },

  publishTheme: async (storeId) => {
    try {
      set({ isSaving: true });
      await trpcClient.themes.publishTheme.mutate({ storeId });
    } catch (error) {
      console.error("Failed to publish theme:", error);
    } finally {
      set({ isSaving: false });
    }
  },

  updateSection: (sectionId, newSettings) => {
    set((state) => {
      const newTheme = structuredClone(state.theme);
      const section = newTheme.templates.home.sections[sectionId];

      if (!section) return state;

      section.settings = {
        ...section.settings,
        ...newSettings,
      };

      return pushToHistory(state, newTheme);
    });
    // Trigger auto-save
    get().saveThemeToServer(1); // Assuming storeId 1 for now
  },

  reorderSections: (newOrder) => {
    set((state) => {
      const newTheme = structuredClone(state.theme);
      newTheme.templates.home.order = newOrder;
      return pushToHistory(state, newTheme);
    });
    get().saveThemeToServer(1);
  },

  addSection: (type) => {
    const entry = SECTION_REGISTRY[type];
    if (!entry) return;

    set((state) => {
      const newTheme = structuredClone(state.theme);
      const newId = `${type}-${Math.random().toString(36).substr(2, 9)}`;
      
      const defaults = getDefaultsFromSchema(entry.schema);
      
      newTheme.templates.home.sections[newId] = {
        id: newId,
        type,
        settings: defaults,
        blocks: {},
        block_order: [],
      };
      
      newTheme.templates.home.order.push(newId);

      return {
        ...pushToHistory(state, newTheme),
        selectedSectionId: newId,
        selectedBlockId: null,
      };
    });
    get().saveThemeToServer(1);
  },

  deleteSection: (sectionId) => {
    set((state) => {
      const newTheme = structuredClone(state.theme);
      delete newTheme.templates.home.sections[sectionId];
      newTheme.templates.home.order = newTheme.templates.home.order.filter(id => id !== sectionId);
      
      return {
        ...pushToHistory(state, newTheme),
        selectedSectionId: state.selectedSectionId === sectionId ? null : state.selectedSectionId,
        selectedBlockId: null,
      };
    });
    get().saveThemeToServer(1);
  },

  duplicateSection: (sectionId) => {
    set((state) => {
      const newTheme = structuredClone(state.theme);
      const source = newTheme.templates.home.sections[sectionId];
      if (!source) return state;

      const newId = `${source.type}-${Math.random().toString(36).substr(2, 9)}`;
      newTheme.templates.home.sections[newId] = {
        ...structuredClone(source),
        id: newId
      };
      
      const index = newTheme.templates.home.order.indexOf(sectionId);
      newTheme.templates.home.order.splice(index + 1, 0, newId);

      return pushToHistory(state, newTheme);
    });
    get().saveThemeToServer(1);
  },

  addBlock: (sectionId, type) => {
    const entry = BLOCK_REGISTRY[type];
    if (!entry) return;

    set((state) => {
      const newTheme = structuredClone(state.theme);
      const section = newTheme.templates.home.sections[sectionId];
      if (!section) return state;

      const newId = `${type}-${Math.random().toString(36).substr(2, 9)}`;
      const defaults = getDefaultsFromSchema(entry.schema);

      if (!section.blocks) section.blocks = {};
      if (!section.block_order) section.block_order = [];

      section.blocks[newId] = {
        id: newId,
        type,
        settings: defaults,
      };
      section.block_order.push(newId);

      return {
        ...pushToHistory(state, newTheme),
        selectedBlockId: newId,
      };
    });
    get().saveThemeToServer(1);
  },

  deleteBlock: (sectionId, blockId) => {
    set((state) => {
      const newTheme = structuredClone(state.theme);
      const section = newTheme.templates.home.sections[sectionId];
      if (!section || !section.blocks) return state;

      delete section.blocks[blockId];
      section.block_order = section.block_order?.filter(id => id !== blockId) || [];

      return {
        ...pushToHistory(state, newTheme),
        selectedBlockId: state.selectedBlockId === blockId ? null : state.selectedBlockId,
      };
    });
    get().saveThemeToServer(1);
  },

  reorderBlocks: (sectionId, newOrder) => {
    set((state) => {
      const newTheme = structuredClone(state.theme);
      const section = newTheme.templates.home.sections[sectionId];
      if (!section) return state;

      section.block_order = newOrder;
      return pushToHistory(state, newTheme);
    });
    get().saveThemeToServer(1);
  },

  updateBlock: (sectionId, blockId, newSettings) => {
    set((state) => {
      const newTheme = structuredClone(state.theme);
      const section = newTheme.templates.home.sections[sectionId];
      if (!section || !section.blocks?.[blockId]) return state;

      section.blocks[blockId].settings = {
        ...section.blocks[blockId].settings,
        ...newSettings,
      };

      return pushToHistory(state, newTheme);
    });
    get().saveThemeToServer(1);
  },

  undo: () => {
    set((state) => {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      return {
        theme: structuredClone(state.history[newIndex]),
        historyIndex: newIndex,
      };
    });
    get().saveThemeToServer(1);
  },

  redo: () => {
    set((state) => {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      return {
        theme: structuredClone(state.history[newIndex]),
        historyIndex: newIndex,
      };
    });
    get().saveThemeToServer(1);
  },
}));

// Helper to handle history push
function pushToHistory(state: any, newTheme: Theme) {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(structuredClone(newTheme));
  if (newHistory.length > 50) newHistory.shift();
  
  return {
    theme: newTheme,
    history: newHistory,
    historyIndex: newHistory.length - 1,
  };
}
