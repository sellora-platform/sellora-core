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
      const sectionIndex = newTheme.sections.findIndex((s) => s.id === sectionId);

      if (sectionIndex === -1) return state;

      newTheme.sections[sectionIndex].settings = {
        ...newTheme.sections[sectionIndex].settings,
        ...newSettings,
      };

      // Push to history and clear redo stack
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(structuredClone(newTheme));
      
      // Limit history to 50
      if (newHistory.length > 50) {
        newHistory.shift();
      }

      return {
        theme: newTheme,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
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
