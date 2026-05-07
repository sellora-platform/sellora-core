export const RichTextBlockSchema = {
  name: "Rich Text",
  type: "rich_text",
  settings: [
    // Content
    { id: "content", type: "textarea", label: "Content (HTML)", default: "<h2>Your Story Starts Here</h2><p>Use this space to share your brand's mission, values, or any message that connects with your audience.</p>" },
    { id: "showDivider", type: "checkbox", label: "Show Decorative Divider", default: false },
    // Layout
    { id: "textAlignment", type: "select", label: "Text Alignment", options: [
      { label: "Left", value: "left" },
      { label: "Center", value: "center" },
      { label: "Right", value: "right" },
      { label: "Justify", value: "justify" },
    ], default: "center" },
    { id: "maxWidth", type: "select", label: "Max Width", options: [
      { label: "Narrow", value: "narrow" },
      { label: "Medium", value: "medium" },
      { label: "Wide", value: "wide" },
      { label: "Full", value: "full" },
    ], default: "medium" },
    { id: "columnLayout", type: "select", label: "Column Layout", options: [
      { label: "Single Column", value: "single" },
      { label: "Two Columns", value: "two" },
      { label: "Three Columns", value: "three" },
    ], default: "single" },
    // Design
    { id: "bgColor", type: "text", label: "Background Color", default: "" },
    { id: "textColor", type: "text", label: "Text Color", default: "" },
    { id: "headingColor", type: "text", label: "Heading Color", default: "" },
    { id: "linkColor", type: "text", label: "Link Color", default: "" },
    { id: "fontSize", type: "select", label: "Font Size", options: [
      { label: "Small", value: "sm" },
      { label: "Medium", value: "md" },
      { label: "Large", value: "lg" },
    ], default: "md" },
    // Spacing
    { id: "paddingTop", type: "range", label: "Padding Top", min: 0, max: 120, step: 4, default: 80 },
    { id: "paddingBottom", type: "range", label: "Padding Bottom", min: 0, max: 120, step: 4, default: 80 },
    { id: "fullWidth", type: "checkbox", label: "Full Width Layout", default: false },
  ]
};

export default function RichTextBlock({ settings }: { settings: any }) {
  return null; // Rendering handled by storefront themes
}
