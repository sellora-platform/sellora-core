export const AboutSchema = {
  name: "About",
  type: "about",
  settings: [
    // Content
    { id: "heading", type: "text", label: "Heading", default: "Our Story" },
    { id: "subheading", type: "text", label: "Subheading", default: "Crafted with purpose." },
    { id: "body", type: "textarea", label: "Body Text", default: "We believe in quality over quantity. Every product is carefully crafted with purpose and intention." },
    { id: "image", type: "image", label: "Image" },
    { id: "buttonText", type: "text", label: "Button Text", default: "Learn More" },
    { id: "buttonLink", type: "url", label: "Button Link", default: "/about" },
    { id: "showButton", type: "checkbox", label: "Show Button", default: false },
    // Layout
    { id: "imagePosition", type: "select", label: "Image Position", options: [
      { label: "Left", value: "left" },
      { label: "Right", value: "right" },
    ], default: "right" },
    { id: "imageStyle", type: "select", label: "Image Style", options: [
      { label: "Square", value: "square" },
      { label: "Rounded", value: "rounded" },
      { label: "Portrait", value: "portrait" },
    ], default: "portrait" },
    { id: "contentAlignment", type: "select", label: "Content Alignment", options: [
      { label: "Left", value: "left" },
      { label: "Center", value: "center" },
    ], default: "left" },
    // Design
    { id: "bgColor", type: "text", label: "Background Color", default: "" },
    { id: "textColor", type: "text", label: "Text Color", default: "" },
    { id: "headingColor", type: "text", label: "Heading Color", default: "" },
    { id: "buttonStyle", type: "select", label: "Button Style", options: [
      { label: "Filled", value: "filled" },
      { label: "Outlined", value: "outlined" },
      { label: "Ghost", value: "ghost" },
    ], default: "outlined" },
    // Spacing
    { id: "paddingTop", type: "range", label: "Padding Top", min: 0, max: 120, step: 4, default: 80 },
    { id: "paddingBottom", type: "range", label: "Padding Bottom", min: 0, max: 120, step: 4, default: 80 },
    { id: "fullWidth", type: "checkbox", label: "Full Width Layout", default: false },
  ]
};

export default function AboutSection({ settings }: { settings: any }) {
  return null; // Rendering handled by storefront themes
}
