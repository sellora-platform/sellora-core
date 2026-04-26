import { useRef, useEffect } from "react";
import { Theme } from "./mockTheme";

interface PreviewIframeProps {
  theme: Theme;
}

export default function PreviewIframe({ theme }: PreviewIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sync theme to iframe whenever it changes
  useEffect(() => {
    const sendUpdate = () => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { type: "UPDATE_THEME", payload: theme },
          "*"
        );
      }
    };

    // Small delay to ensure iframe is loaded if it's the first time
    const timer = setTimeout(sendUpdate, 100);
    return () => clearTimeout(timer);
  }, [theme]);

  return (
    <div style={{ width: "100%", height: "100%", background: "#eee" }}>
      <iframe
        ref={iframeRef}
        src="/preview.html"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          background: "white",
        }}
        title="Storefront Preview"
      />
    </div>
  );
}
