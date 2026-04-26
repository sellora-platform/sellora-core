import { useState, useEffect } from "react";
import { SECTION_REGISTRY } from "../sections/registry";
import { Theme } from "../editor/mockTheme";

export default function PreviewApp() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "UPDATE_THEME") {
        console.log("[Preview] Theme updated:", event.data.payload);
        setTheme(event.data.payload);
      }
    };

    window.addEventListener("message", handleMessage);
    
    // Notify editor that preview is ready
    window.parent.postMessage({ type: "PREVIEW_READY" }, "*");

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (!theme) {
    return <div style={{ padding: "20px", fontFamily: "sans-serif" }}>Loading preview...</div>;
  }

  return (
    <div>
      {theme.templates.home.order.map((sectionId) => {
        const section = theme.templates.home.sections[sectionId];
        if (!section) return null;
        
        const Component = SECTION_REGISTRY[section.type]?.component;
        if (!Component) return null;
        
        return <Component key={sectionId} settings={section.settings} />;
      })}
    </div>
  );
}
