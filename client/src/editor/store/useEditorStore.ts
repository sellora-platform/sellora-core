import { create } from "zustand";
import { Theme, mockTheme } from "../mockTheme";
import { SECTION_REGISTRY } from "../../sections/registry";
import { BLOCK_REGISTRY } from "../../blocks/registry";
import { trpcClient } from "../../lib/trpc-client";
import { importTheme } from "../utils/importTheme";
import { mergeThemes } from "../utils/mergeThemes";
import { rebuildThemeFromEvents, EditorEvent } from "../utils/rebuildTheme";

interface EditorState {
  theme: Theme;
  selectedSectionId: string | null;
  selectedBlockId: string | null;
  history: Theme[];
  historyIndex: number;
  isSaving: boolean;
  syncStatus: "idle" | "syncing" | "conflict" | "error";
  currentVersion: number;
  eventQueue: EditorEvent[];

  // Actions
  setTheme: (theme: Theme) => void;
  getThemeSnapshot: () => Theme;
  setSelectedSection: (id: string | null) => void;
  setSelectedBlock: (id: string | null) => void;
  
  // Event-Driven Actions
  emitEvent: (event: Omit<EditorEvent, "timestamp">) => void;
  
  // High-level Actions (Refactored to emit events)
  updateSection: (sectionId: string, settings: any) => void;
  reorderSections: (newOrder: string[]) => void;
  addSection: (type: string) => void;
  deleteSection: (sectionId: string) => void;
  duplicateSection: (sectionId: string) => void;
  addBlock: (sectionId: string, type: string) => void;
  deleteBlock: (sectionId: string, blockId: string) => void;
  reorderBlocks: (sectionId: string, newOrder: string[]) => void;
  updateBlock: (sectionId: string, blockId: string, settings: any) => void;

  // Persistence Actions
  loadThemeFromServer: (storeId: number) => Promise<void>;
  syncEventsToServer: (storeId: number) => Promise<void>;
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

let syncTimeout: ReturnType<typeof setTimeout> | null = null;
const syncChannel = new BroadcastChannel("sellora-editor-sync");

export const useEditorStore = create<EditorState>((set, get) => {
  
  syncChannel.onmessage = (event) => {
    if (event.data.type === "THEME_UPDATED") {
      set({ 
        theme: event.data.theme,
        currentVersion: event.data.version,
        history: [structuredClone(event.data.theme)],
        historyIndex: 0
      });
    }
  };

  return {
    theme: mockTheme,
    selectedSectionId: "hero-1",
    selectedBlockId: null,
    history: [structuredClone(mockTheme)],
    historyIndex: 0,
    isSaving: false,
    syncStatus: "idle",
    currentVersion: 0,
    eventQueue: [],

    setTheme: (theme) => set({ theme }),
    
    getThemeSnapshot: () => structuredClone(get().theme),
    
    setSelectedSection: (id) => set({ selectedSectionId: id, selectedBlockId: null }),
    
    setSelectedBlock: (id) => set({ selectedBlockId: id }),

    emitEvent: (e) => {
      const event: EditorEvent = { ...e, timestamp: Date.now() };
      
      set((state) => {
        // 1. Update state using reconstruction engine (local optimistic update)
        const newTheme = rebuildThemeFromEvents(state.theme, [event]);
        
        // 2. Add to local queue for batch syncing
        const newQueue = [...state.eventQueue, event];
        
        return {
          theme: newTheme,
          eventQueue: newQueue,
          ...pushToHistory(state, newTheme)
        };
      });

      // 3. Schedule batch sync
      get().syncEventsToServer(1); // Assuming storeId 1
    },

    loadThemeFromServer: async (storeId) => {
      try {
        set({ syncStatus: "syncing" });
        const data = await trpcClient.themes.getTheme.query({ storeId });
        if (data && data.draftConfig) {
          const theme = importTheme(data.draftConfig);
          set({ 
            theme, 
            currentVersion: data.version,
            history: [structuredClone(theme)], 
            historyIndex: 0,
            syncStatus: "idle"
          });
        }
      } catch (error) {
        set({ syncStatus: "error" });
      }
    },

    syncEventsToServer: async (storeId) => {
      if (syncTimeout) clearTimeout(syncTimeout);

      syncTimeout = setTimeout(async () => {
        const events = get().eventQueue;
        if (events.length === 0) return;

        set({ isSaving: true, syncStatus: "syncing" });

        try {
          const baseVersion = get().currentVersion;
          const response: any = await trpcClient.themes.appendEvents.mutate({
            storeId,
            events,
            baseVersion
          });

          if (response.status === "success") {
            set((state) => ({ 
              isSaving: false, 
              syncStatus: "idle",
              currentVersion: response.newVersion,
              // Clear only the events we just synced
              eventQueue: state.eventQueue.filter(e => !events.includes(e))
            }));

            syncChannel.postMessage({
              type: "THEME_UPDATED",
              theme: get().theme,
              version: response.newVersion
            });
          }
        } catch (error) {
          set({ isSaving: false, syncStatus: "error" });
        }
      }, 500);
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

    // High-level Actions refactored to use Events
    updateSection: (sectionId, settings) => {
      get().emitEvent({ type: "SECTION_UPDATED", sectionId, payload: settings });
    },

    reorderSections: (newOrder) => {
      get().emitEvent({ type: "SECTION_REORDERED", payload: newOrder });
    },

    addSection: (type) => {
      const entry = SECTION_REGISTRY[type];
      if (!entry) return;
      const newId = `${type}-${Math.random().toString(36).substr(2, 9)}`;
      const defaults = getDefaultsFromSchema(entry.schema);
      
      get().emitEvent({ 
        type: "SECTION_ADDED", 
        payload: { id: newId, type, settings: defaults, blocks: {}, block_order: [] } 
      });
      set({ selectedSectionId: newId });
    },

    deleteSection: (sectionId) => {
      get().emitEvent({ type: "SECTION_DELETED", sectionId });
      if (get().selectedSectionId === sectionId) set({ selectedSectionId: null });
    },

    duplicateSection: (sectionId) => {
      const source = get().theme.templates.home.sections[sectionId];
      if (!source) return;
      const newId = `${source.type}-${Math.random().toString(36).substr(2, 9)}`;
      get().emitEvent({ 
        type: "SECTION_ADDED", 
        payload: { ...structuredClone(source), id: newId } 
      });
    },

    addBlock: (sectionId, type) => {
      const entry = BLOCK_REGISTRY[type];
      if (!entry) return;
      const newId = `${type}-${Math.random().toString(36).substr(2, 9)}`;
      const defaults = getDefaultsFromSchema(entry.schema);

      get().emitEvent({ 
        type: "BLOCK_ADDED", 
        sectionId, 
        payload: { id: newId, type, settings: defaults } 
      });
      set({ selectedBlockId: newId });
    },

    deleteBlock: (sectionId, blockId) => {
      get().emitEvent({ type: "BLOCK_DELETED", sectionId, blockId });
      if (get().selectedBlockId === blockId) set({ selectedBlockId: null });
    },

    reorderBlocks: (sectionId, newOrder) => {
      get().emitEvent({ type: "BLOCK_REORDERED", sectionId, payload: newOrder });
    },

    updateBlock: (sectionId, blockId, settings) => {
      get().emitEvent({ type: "BLOCK_UPDATED", sectionId, blockId, payload: settings });
    },

    undo: () => {
      set((state) => {
        if (state.historyIndex <= 0) return state;
        const newIndex = state.historyIndex - 1;
        const newTheme = structuredClone(state.history[newIndex]);
        // Note: In a pure event-driven system, undo would be an event too.
        // For now, we stick to state-based undo for UI simplicity.
        return {
          theme: newTheme,
          historyIndex: newIndex,
        };
      });
    },

    redo: () => {
      set((state) => {
        if (state.historyIndex >= state.history.length - 1) return state;
        const newIndex = state.historyIndex + 1;
        const newTheme = structuredClone(state.history[newIndex]);
        return {
          theme: newTheme,
          historyIndex: newIndex,
        };
      });
    },
  };
});

function pushToHistory(state: any, newTheme: Theme) {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(structuredClone(newTheme));
  if (newHistory.length > 50) newHistory.shift();
  
  return {
    history: newHistory,
    historyIndex: newHistory.length - 1,
  };
}
