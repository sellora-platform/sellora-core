export const AnnouncementBarSchema = {
  name: "Announcement Bar",
  type: "announcement_bar",
  settings: [
    // Content
    { id: "text", type: "text", label: "Message", default: "Free shipping on orders over $50 — Shop Now" },
    { id: "showCloseButton", type: "checkbox", label: "Show Close Button", default: true },
    { id: "link", type: "url", label: "Link", default: "/products" },
    { id: "linkText", type: "text", label: "Link Text", default: "Shop Now →" },
    { id: "showLink", type: "checkbox", label: "Show Link", default: false },
    // Layout
    { id: "textAlignment", type: "select", label: "Text Alignment", options: [
      { label: "Left", value: "left" },
      { label: "Center", value: "center" },
      { label: "Right", value: "right" },
    ], default: "center" },
    { id: "marquee", type: "checkbox", label: "Scrolling Text (Marquee)", default: false },
    { id: "marqueeSpeed", type: "select", label: "Marquee Speed", options: [
      { label: "Slow", value: "slow" },
      { label: "Normal", value: "normal" },
      { label: "Fast", value: "fast" },
    ], default: "normal" },
    // Design
    { id: "bgColor", type: "text", label: "Background Color", default: "#18181b" },
    { id: "textColor", type: "text", label: "Text Color", default: "#ffffff" },
    { id: "linkColor", type: "text", label: "Link Color", default: "" },
    { id: "fontSize", type: "select", label: "Font Size", options: [
      { label: "Small", value: "text-[10px]" },
      { label: "Medium", value: "text-xs" },
      { label: "Large", value: "text-sm" },
    ], default: "text-[11px]" },
    { id: "fontWeight", type: "select", label: "Font Weight", options: [
      { label: "Normal", value: "font-normal" },
      { label: "Medium", value: "font-medium" },
      { label: "Bold", value: "font-bold" },
    ], default: "font-medium" },
  ]
};

export default function AnnouncementBar({ settings }: { settings: any }) {
  return null; // Rendering handled by storefront themes
}
