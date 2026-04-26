import React from "react";
import { SECTION_REGISTRY } from "../sections/registry";
import { RenderField } from "./RenderField";
import { useEditorStore } from "./store/useEditorStore";

export const Sidebar: React.FC = () => {
  const { theme, selectedSectionId, updateSection } = useEditorStore();

  const selectedSection = theme.sections.find((s) => s.id === selectedSectionId);
  const registryEntry = selectedSection ? SECTION_REGISTRY[selectedSection.type] : null;

  const handleFieldChange = (fieldId: string, newValue: any) => {
    if (!selectedSectionId) return;
    updateSection(selectedSectionId, { [fieldId]: newValue });
  };

  if (!selectedSection || !registryEntry) {
    return (
      <div style={{ padding: "20px", color: "#666" }}>
        Select a section to edit its settings.
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h3 style={{ marginBottom: "20px", fontSize: "1.2rem", color: "#000" }}>
        {registryEntry.schema.name}
      </h3>

      {registryEntry.schema.settings.map((setting: any) => (
        <RenderField
          key={setting.id}
          setting={setting}
          value={selectedSection.settings[setting.id]}
          onChange={handleFieldChange}
        />
      ))}
    </div>
  );
};
