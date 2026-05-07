export const VideoSectionSchema = {
  name: "Video Section",
  type: "video_section",
  settings: [
    // Content
    { id: "heading", type: "text", label: "Heading", default: "See It In Action" },
    { id: "subheading", type: "textarea", label: "Subheading", default: "Watch how our products transform your everyday routine." },
    { id: "showSubheading", type: "checkbox", label: "Show Subheading", default: true },
    { id: "videoUrl", type: "url", label: "YouTube/Vimeo URL", default: "" },
    { id: "posterImage", type: "image", label: "Poster/Thumbnail Image" },
    { id: "showControls", type: "checkbox", label: "Show Controls", default: true },
    // Layout
    { id: "layout", type: "select", label: "Layout", options: [
      { label: "Full Width", value: "full-width" },
      { label: "Contained", value: "contained" },
    ], default: "contained" },
    { id: "aspectRatio", type: "select", label: "Aspect Ratio", options: [
      { label: "16:9", value: "16/9" },
      { label: "4:3", value: "4/3" },
      { label: "1:1", value: "1/1" },
      { label: "21:9 (Cinematic)", value: "21/9" },
    ], default: "16/9" },
    { id: "contentAlignment", type: "select", label: "Header Alignment", options: [
      { label: "Left", value: "left" },
      { label: "Center", value: "center" },
      { label: "Right", value: "right" },
    ], default: "center" },
    { id: "playButtonStyle", type: "select", label: "Play Button Style", options: [
      { label: "Minimal", value: "minimal" },
      { label: "Filled", value: "filled" },
      { label: "Outlined", value: "outlined" },
    ], default: "minimal" },
    // Design
    { id: "bgColor", type: "text", label: "Background Color", default: "" },
    { id: "textColor", type: "text", label: "Text Color", default: "" },
    { id: "overlayColor", type: "text", label: "Overlay Color", default: "" },
    // Spacing
    { id: "paddingTop", type: "range", label: "Padding Top", min: 0, max: 120, step: 4, default: 80 },
    { id: "paddingBottom", type: "range", label: "Padding Bottom", min: 0, max: 120, step: 4, default: 80 },
    { id: "fullWidth", type: "checkbox", label: "Full Width Layout", default: false },
  ]
};

export default function VideoSection({ settings }: { settings: any }) {
  return null; // Rendering handled by storefront themes
}
