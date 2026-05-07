import React from "react";
import { SECTION_REGISTRY } from "../sections/registry";
import { useEditorStore } from "./store/useEditorStore";
import { X } from "lucide-react";

interface SectionLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SectionLibraryModal: React.FC<SectionLibraryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addSection } = useEditorStore();

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: "500px",
          maxHeight: "80vh",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: "20px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "bold" }}>Add Section</h2>
          <button onClick={onClose} style={{ padding: "5px", color: "#666", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: "20px", overflowY: "auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
          {Object.entries(SECTION_REGISTRY).map(([type, entry]) => (
            <div 
              key={type}
              onClick={() => {
                addSection(type);
                onClose();
              }}
              style={{
                padding: "20px",
                border: "1px solid #eee",
                borderRadius: "8px",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.2s",
              }}
              className="hover:border-blue-500 hover:bg-blue-50 group"
            >
              <div style={{ fontWeight: "bold", color: "#333" }} className="group-hover:text-blue-600">
                {entry.schema.name}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#999", marginTop: "4px" }}>
                Type: {type}
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: "15px 20px", background: "#f9f9f9", fontSize: "0.85rem", color: "#666" }}>
          Choose a section to add it to your home page.
        </div>
      </div>
    </div>
  );
};
