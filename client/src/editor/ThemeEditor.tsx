import { useState } from "react";
import { mockTheme, Theme } from "./mockTheme";
import PreviewIframe from "./PreviewIframe";

export default function ThemeEditor() {
  const [theme, setTheme] = useState<Theme>(mockTheme);

  const handleHeadingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // structuredClone to ensure a clean deep copy for React state & postMessage
    const newTheme = structuredClone(theme);
    newTheme.sections[0].settings.heading = e.target.value;
    setTheme(newTheme);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTheme = structuredClone(theme);
    newTheme.sections[0].settings.bgColor = e.target.value;
    setTheme(newTheme);
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "350px",
          borderRight: "1px solid #ddd",
          padding: "20px",
          background: "#f9f9f9",
          zIndex: 10,
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>Sellora Editor</h2>
        
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            Hero Heading
          </label>
          <input
            type="text"
            value={theme.sections[0].settings.heading}
            onChange={handleHeadingChange}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            Background Color
          </label>
          <input
            type="color"
            value={theme.sections[0].settings.bgColor}
            onChange={handleColorChange}
            style={{
              width: "100%",
              height: "40px",
              padding: "2px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
          />
        </div>

        <div style={{ marginTop: "40px", color: "#666", fontSize: "0.9rem" }}>
          <p>Changes are synced to the preview via postMessage.</p>
        </div>
      </aside>

      {/* Main Preview Area */}
      <main style={{ flex: 1, position: "relative" }}>
        <PreviewIframe theme={theme} />
      </main>
    </div>
  );
}
