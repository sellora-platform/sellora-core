import { useEditorStore } from "../store/useEditorStore";
import { ProjectionEngine } from "./projectionEngine";

/**
 * Stable Selector Factories.
 * These factories create memoized selector functions that are referentially 
 * stable across renders, preventing unnecessary React hook invalidations.
 */

/**
 * Returns a selector that projects a specific section.
 * Re-runs only if raw section data or event queue changes.
 */
export const makeSectionSelector = (sectionId: string) => {
  return (state: any) => {
    return ProjectionEngine.getProjectedSection(
      sectionId, 
      state.theme, 
      state.eventQueue
    );
  };
};

/**
 * Returns a selector that projects a specific block.
 */
export const makeBlockSelector = (sectionId: string, blockId: string) => {
  return (state: any) => {
    return ProjectionEngine.getProjectedBlock(
      sectionId, 
      blockId, 
      state.theme, 
      state.eventQueue
    );
  };
};

/**
 * Returns a selector for section existence/order.
 */
export const sectionOrderSelector = (state: any) => state.theme.templates.home.order;
