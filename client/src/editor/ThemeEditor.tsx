import { useState } from "react";
import { mockTheme, Theme } from "./mockTheme";
import PreviewIframe from "./PreviewIframe";
import { Sidebar } from "./Sidebar";

export default function ThemeEditor() {
  const [theme, setTheme] = useState<Theme>(mockTheme);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>("hero-1");

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
      {/* Sidebar Area */}
      <aside
        style={{
          width: "350px",
          borderRight: "1px solid #ddd",
          background: "#f9f9f9",
          zIndex: 10,
          overflowY: "auto",
        }}
      >
        <div style={{ padding: "20px", borderBottom: "1px solid #ddd" }}>
          <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Sellora Editor</h2>
        </div>

        <Sidebar
          theme={theme}
          selectedSectionId={selectedSectionId}
          onThemeUpdate={setTheme}
        />

        <div style={{ padding: "20px", color: "#666", fontSize: "0.85rem", borderTop: "1px solid #ddd" }}>
          <p>This UI is auto-generated from the Section Schema.</p>
        </div>
      </aside>

      {/* Main Preview Area */}
      <main style={{ flex: 1, position: "relative" }}>
        <PreviewIframe theme={theme} />
      </main>
    </div>
  );
}
