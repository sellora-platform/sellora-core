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
  clientId: string;

  // Actions
  setTheme: (theme: Theme) => void;
  getThemeSnapshot: () => Theme;
  setSelectedSection: (id: string | null) => void;
  setSelectedBlock: (id: string | null) => void;
  
  // Event-Driven Actions
  emitEvent: (event: Omit<EditorEvent, "timestamp" | "eventId" | "clientId" | "themeId">) => void;
  
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

// Generate a persistent clientId for this tab session
const SESSION_CLIENT_ID = `client-${Math.random().toString(36).substr(2, 9)}`;

export const useEditorStore = create<EditorState>((set, get) => {
  
  syncChannel.onmessage = (event) => {
    if (event.data.type === "THEME_UPDATED" && event.data.clientId !== SESSION_CLIENT_ID) {
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
    clientId: SESSION_CLIENT_ID,

    setTheme: (theme) => set({ theme }),
    
    getThemeSnapshot: () => structuredClone(get().theme),
    
    setSelectedSection: (id) => set({ selectedSectionId: id, selectedBlockId: null }),
    
    setSelectedBlock: (id) => set({ selectedBlockId: id }),

    emitEvent: (e) => {
      const event: EditorEvent = { 
        ...e, 
        eventId: crypto.randomUUID(),
        clientId: SESSION_CLIENT_ID,
        themeId: "default-theme", 
        timestamp: Date.now() 
      };
      
      set((state) => {
        // Surgical Immutable Update
        let nextTheme = state.theme;

        if (event.type === "SECTION_UPDATED") {
          const sectionId = event.sectionId!;
          nextTheme = {
            ...state.theme,
            templates: {
              ...state.theme.templates,
              home: {
                ...state.theme.templates.home,
                sections: {
                  ...state.theme.templates.home.sections,
                  [sectionId]: {
                    ...state.theme.templates.home.sections[sectionId],
                    settings: { 
                      ...state.theme.templates.home.sections[sectionId].settings, 
                      ...event.payload 
                    }
                  }
                }
              }
            }
          };
        } else if (event.type === "BLOCK_UPDATED") {
          const { sectionId, blockId } = event;
          const section = state.theme.templates.home.sections[sectionId!];
          nextTheme = {
            ...state.theme,
            templates: {
              ...state.theme.templates,
              home: {
                ...state.theme.templates.home,
                sections: {
                  ...state.theme.templates.home.sections,
                  [sectionId!]: {
                    ...section,
                    blocks: {
                      ...section.blocks,
                      [blockId!]: {
                        ...section.blocks[blockId!],
                        settings: {
                          ...section.blocks[blockId!].settings,
                          ...event.payload
                        }
                      }
                    }
                  }
                }
              }
            }
          };
        } else {
          // Structural changes use the reconstruction engine
          nextTheme = rebuildThemeFromEvents(state.theme, [event]);
        }
        
        return {
          theme: nextTheme,
          eventQueue: [...state.eventQueue, event],
          ...pushToHistory(state, nextTheme)
        };
      });

      get().syncEventsToServer(1);
    },

    loadThemeFromServer: async (storeId) => {
      try {
        set({ syncStatus: "syncing" });
        // In a hardened system, we'd fetch the latest snapshot + events after snapshot
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
            themeId: "default-theme",
            clientId: SESSION_CLIENT_ID,
            events,
            baseVersion
          });

          if (response.status === "success") {
            const newVersion = response.newVersion || baseVersion;
            set((state) => ({ 
              isSaving: false, 
              syncStatus: "idle",
              currentVersion: newVersion,
              eventQueue: state.eventQueue.filter(e => !events.includes(e))
            }));

            syncChannel.postMessage({
              type: "THEME_UPDATED",
              theme: get().theme,
              version: newVersion,
              clientId: SESSION_CLIENT_ID
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
