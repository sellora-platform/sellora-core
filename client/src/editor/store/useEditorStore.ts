import { create } from "zustand";
import { Theme, mockTheme } from "../mockTheme";

interface EditorState {
  theme: Theme;
  selectedSectionId: string | null;
  history: Theme[];
  historyIndex: number;

  // Actions
  setTheme: (theme: Theme) => void;
  setSelectedSection: (id: string | null) => void;
  updateSection: (sectionId: string, settings: any) => void;
  reorderSections: (newOrder: string[]) => void;
  deleteSection: (sectionId: string) => void;
  duplicateSection: (sectionId: string) => void;
  undo: () => void;
  redo: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  theme: mockTheme,
  selectedSectionId: "hero-1",
  history: [structuredClone(mockTheme)],
  historyIndex: 0,

  setTheme: (theme) => set({ theme }),
  
  setSelectedSection: (id) => set({ selectedSectionId: id }),

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
  },

  reorderSections: (newOrder) => {
    set((state) => {
      const newTheme = structuredClone(state.theme);
      newTheme.templates.home.order = newOrder;
      return pushToHistory(state, newTheme);
    });
  },

  deleteSection: (sectionId) => {
    set((state) => {
      const newTheme = structuredClone(state.theme);
      delete newTheme.templates.home.sections[sectionId];
      newTheme.templates.home.order = newTheme.templates.home.order.filter(id => id !== sectionId);
      
      return {
        ...pushToHistory(state, newTheme),
        selectedSectionId: state.selectedSectionId === sectionId ? null : state.selectedSectionId
      };
    });
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
