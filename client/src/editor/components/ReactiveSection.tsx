import React, { memo, useMemo } from "react";
import { useEditorStore } from "../store/useEditorStore";
import { SECTION_REGISTRY } from "../../sections/registry";
import { makeSectionSelector, makeBlockSelector } from "../core/selectors";

interface SectionRendererProps {
  sectionId: string;
}

export const ReactiveSection = memo(({ sectionId }: SectionRendererProps) => {
  // Create a stable selector for this specific sectionId
  const sectionSelector = useMemo(() => makeSectionSelector(sectionId), [sectionId]);
  const section = useEditorStore(sectionSelector);
  
  const isSelected = useEditorStore((state) => state.selectedSectionId === sectionId);
  const setSelectedSection = useEditorStore((state) => state.setSelectedSection);

  if (!section) return null;

  const Component = SECTION_REGISTRY[section.type]?.component;
  if (!Component) return null;

  return (
    <div 
      className={`relative group transition-all ${isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedSection(sectionId);
      }}
      data-section-id={sectionId}
    >
      <Component {...section.settings}>
        {/* Render Blocks with their own isolation */}
        {section.block_order?.map((blockId: string) => (
          <ReactiveBlock 
            key={blockId} 
            sectionId={sectionId} 
            blockId={blockId} 
          />
        ))}
      </Component>
    </div>
  );
});

interface BlockRendererProps {
  sectionId: string;
  blockId: string;
}

/**
 * Block-level isolation: Only re-renders if this specific block's settings change.
 */
const ReactiveBlock = memo(({ sectionId, blockId }: BlockRendererProps) => {
  // Create a stable selector for this specific blockId
  const blockSelector = useMemo(() => makeBlockSelector(sectionId, blockId), [sectionId, blockId]);
  const block = useEditorStore(blockSelector);
  
  const isSelected = useEditorStore((state) => state.selectedBlockId === blockId);
  const setSelectedBlock = useEditorStore((state) => state.setSelectedBlock);

  if (!block) return null;

  // In a real system, we'd look up the block component from a registry
  // For this demo, we'll assume a generic block renderer
  return (
    <div 
      className={`relative ${isSelected ? 'outline outline-2 outline-blue-400' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedBlock(blockId);
      }}
      data-block-id={blockId}
    >
      {/* Block content here */}
      <pre className="text-[10px] bg-slate-100 p-1">
        {block.type}: {JSON.stringify(block.settings)}
      </pre>
    </div>
  );
});

ReactiveSection.displayName = "ReactiveSection";
ReactiveBlock.displayName = "ReactiveBlock";
