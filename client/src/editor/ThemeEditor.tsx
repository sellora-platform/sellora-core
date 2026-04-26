import { useEditorStore } from "./store/useEditorStore";
import PreviewIframe from "./PreviewIframe";
import { Sidebar } from "./Sidebar";

export default function ThemeEditor() {
  const { theme, undo, redo, historyIndex, history } = useEditorStore();

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
      {/* Sidebar Area */}
      <aside
        style={{
          width: "350px",
          borderRight: "1px solid #ddd",
          background: "#f9f9f9",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "20px", borderBottom: "1px solid #ddd", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Sellora</h2>
          
          <div style={{ display: "flex", gap: "5px" }}>
            <button 
              onClick={undo} 
              disabled={historyIndex === 0}
              style={{ padding: "5px 10px", cursor: historyIndex === 0 ? "not-allowed" : "pointer" }}
            >
              Undo
            </button>
            <button 
              onClick={redo} 
              disabled={historyIndex >= history.length - 1}
              style={{ padding: "5px 10px", cursor: historyIndex >= history.length - 1 ? "not-allowed" : "pointer" }}
            >
              Redo
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          <Sidebar />
        </div>

        <div style={{ padding: "20px", color: "#666", fontSize: "0.85rem", borderTop: "1px solid #ddd" }}>
          <p>Global State: Zustand | History: {historyIndex + 1}/{history.length}</p>
        </div>
      </aside>

      {/* Main Preview Area */}
      <main style={{ flex: 1, position: "relative" }}>
        <PreviewIframe theme={theme} />
      </main>
    </div>
  );
}
