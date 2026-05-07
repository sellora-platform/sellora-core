import { Theme } from "../mockTheme";
import { EditorEvent, projectSection, projectBlock } from "../utils/rebuildTheme";

/**
 * Cache for derived computations.
 * Maps id -> { state: derivedValue, lastProcessedEventId: string }
 */
const sectionCache = new Map<string, { state: any; lastEventId: string }>();
const blockCache = new Map<string, { state: any; lastEventId: string }>();

/**
 * Projection Engine: Decouples raw state from derived UI state.
 * Implements granular memoization and dependency tracking.
 */
export const ProjectionEngine = {
  /**
   * Projects and caches a section state.
   */
  getProjectedSection: (sectionId: string, rawTheme: Theme, events: EditorEvent[]) => {
    const lastEventId = events.length > 0 ? events[events.length - 1].eventId : "initial";
    const cached = sectionCache.get(sectionId);

    // If cache is valid, return it
    if (cached && cached.lastEventId === lastEventId) {
      return cached.state;
    }

    // Otherwise, compute and cache
    const rawSection = rawTheme.templates.home.sections[sectionId];
    const derivedState = projectSection(rawSection, sectionId, events);
    
    sectionCache.set(sectionId, { state: derivedState, lastEventId });
    return derivedState;
  },

  /**
   * Projects and caches a block state.
   */
  getProjectedBlock: (sectionId: string, blockId: string, rawTheme: Theme, events: EditorEvent[]) => {
    const lastEventId = events.length > 0 ? events[events.length - 1].eventId : "initial";
    const cacheKey = `${sectionId}:${blockId}`;
    const cached = blockCache.get(cacheKey);

    if (cached && cached.lastEventId === lastEventId) {
      return cached.state;
    }

    const rawBlock = rawTheme.templates.home.sections[sectionId]?.blocks?.[blockId];
    const derivedState = projectBlock(rawBlock, sectionId, blockId, events);

    blockCache.set(cacheKey, { state: derivedState, lastEventId });
    return derivedState;
  },

  /**
   * Invalidate cache for a specific target.
   */
  invalidate: (id: string) => {
    sectionCache.delete(id);
    blockCache.delete(id);
  }
};
