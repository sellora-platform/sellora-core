import { useEditorStore } from "./store/useEditorStore";
import PreviewIframe from "./PreviewIframe";
import { Sidebar } from "./Sidebar";
import { SectionList } from "./SectionList";
import { ChevronLeft } from "lucide-react";

export default function ThemeEditor() {
  const { theme, undo, redo, historyIndex, history, selectedSectionId, setSelectedSection } = useEditorStore();

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
        <div style={{ padding: "15px 20px", borderBottom: "1px solid #ddd", display: "flex", justifyContent: "space-between", alignItems: "center", background: "white" }}>
          <div className="flex items-center gap-2">
            {selectedSectionId && (
              <button 
                onClick={() => setSelectedSection(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: "bold" }}>
              {selectedSectionId ? "Edit Section" : "Home Page"}
            </h2>
          </div>
          
          <div style={{ display: "flex", gap: "5px" }}>
            <button 
              onClick={undo} 
              disabled={historyIndex === 0}
              className={`p-1.5 rounded ${historyIndex === 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"}`}
              title="Undo"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 14L4 9l5-5"/><path d="M20 20v-7a4 4 0 00-4-4H4"/></svg>
            </button>
            <button 
              onClick={redo} 
              disabled={historyIndex >= history.length - 1}
              className={`p-1.5 rounded ${historyIndex >= history.length - 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"}`}
              title="Redo"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 14l5-5-5-5"/><path d="M4 20v-7a4 4 0 014-4h12"/></svg>
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {selectedSectionId ? <Sidebar /> : <SectionList />}
        </div>

        <div style={{ padding: "15px 20px", color: "#666", fontSize: "0.75rem", borderTop: "1px solid #ddd", background: "white" }}>
          <p>Global State: Zustand | History: {historyIndex + 1}/{history.length}</p>
        </div>
      </aside>

      {/* Main Preview Area */}
      <main style={{ flex: 1, position: "relative", background: "#f0f0f0" }}>
        <PreviewIframe theme={theme} />
      </main>
    </div>
  );
}
