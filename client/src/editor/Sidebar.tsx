import React from "react";
import { SECTION_REGISTRY } from "../sections/registry";
import { BLOCK_REGISTRY } from "../blocks/registry";
import { RenderField } from "./RenderField";
import { useEditorStore } from "./store/useEditorStore";
import { ChevronLeft, Plus, Trash2, GripVertical } from "lucide-react";

export const Sidebar: React.FC = () => {
  const { 
    theme, 
    selectedSectionId, 
    selectedBlockId,
    setSelectedBlock,
    updateSection, 
    addBlock, 
    deleteBlock, 
    updateBlock 
  } = useEditorStore();

  const selectedSection = selectedSectionId ? theme.templates.home.sections[selectedSectionId] : null;
  const registryEntry = selectedSection ? SECTION_REGISTRY[selectedSection.type] : null;

  // If a block is selected, show Block Settings
  if (selectedBlockId && selectedSection) {
    const block = selectedSection.blocks?.[selectedBlockId];
    const blockRegistryEntry = block ? BLOCK_REGISTRY[block.type] : null;

    if (block && blockRegistryEntry) {
      return (
        <div style={{ padding: "20px" }}>
          <button 
            onClick={() => setSelectedBlock(null)}
            className="flex items-center gap-2 text-sm text-blue-600 mb-6 hover:underline"
          >
            <ChevronLeft size={16} /> Back to {registryEntry?.schema.name}
          </button>

          <h3 className="text-lg font-bold mb-4">{blockRegistryEntry.schema.name} Settings</h3>
          
          {blockRegistryEntry.schema.settings.map((setting: any) => (
            <RenderField
              key={setting.id}
              setting={setting}
              value={block.settings[setting.id]}
              onChange={(id, val) => updateBlock(selectedSectionId!, selectedBlockId!, { [id]: val })}
            />
          ))}

          <button 
            onClick={() => deleteBlock(selectedSectionId!, selectedBlockId!)}
            className="w-full mt-8 py-2 text-red-600 border border-red-200 rounded hover:bg-red-50 flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Trash2 size={14} /> Delete Block
          </button>
        </div>
      );
    }
  }

  if (!selectedSectionId || !selectedSection || !registryEntry) {
    return <div className="p-4 text-gray-500">Select a section to edit.</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h3 className="text-lg font-bold mb-6">{registryEntry.schema.name}</h3>

      <div className="mb-8 pb-8 border-b">
        <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">Settings</h4>
        {registryEntry.schema.settings.map((setting: any) => (
          <RenderField
            key={setting.id}
            setting={setting}
            value={selectedSection.settings[setting.id]}
            onChange={(id, val) => updateSection(selectedSectionId, { [id]: val })}
          />
        ))}
      </div>

      <div className="blocks-section">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase">Blocks</h4>
          {registryEntry.schema.blocks && (
            <button 
              onClick={() => addBlock(selectedSectionId, registryEntry.schema.blocks[0].type)}
              className="text-blue-600 hover:text-blue-700 p-1"
            >
              <Plus size={18} />
            </button>
          )}
        </div>

        <div className="space-y-2">
          {selectedSection.block_order?.map((blockId) => {
            const block = selectedSection.blocks?.[blockId];
            if (!block) return null;
            const blockSchema = BLOCK_REGISTRY[block.type]?.schema;
            
            return (
              <div 
                key={blockId}
                onClick={() => setSelectedBlock(blockId)}
                className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-400 cursor-pointer group"
              >
                <GripVertical size={14} className="text-gray-300" />
                <span className="flex-1 text-sm font-medium">{blockSchema?.name || block.type}</span>
                <Trash2 
                  size={14} 
                  className="text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteBlock(selectedSectionId, blockId);
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
