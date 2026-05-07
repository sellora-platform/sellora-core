export const ContactSchema = {
  name: "Contact",
  type: "contact",
  settings: [
    // Content
    { id: "heading", type: "text", label: "Heading", default: "Get In Touch" },
    { id: "subheading", type: "textarea", label: "Subheading", default: "We'd love to hear from you. Send us a message and we'll get back within 24 hours." },
    { id: "showSubheading", type: "checkbox", label: "Show Subheading", default: true },
    { id: "email", type: "text", label: "Contact Email", default: "hello@store.com" },
    { id: "phone", type: "text", label: "Phone Number", default: "" },
    { id: "address", type: "textarea", label: "Address", default: "" },
    { id: "showContactInfo", type: "checkbox", label: "Show Contact Info", default: true },
    { id: "showMap", type: "checkbox", label: "Show Map", default: false },
    { id: "mapEmbedUrl", type: "url", label: "Google Maps Embed URL", default: "" },
    // Layout
    { id: "layout", type: "select", label: "Layout", options: [
      { label: "Side by Side", value: "side" },
      { label: "Stacked", value: "stacked" },
      { label: "Form Only", value: "form-only" },
    ], default: "side" },
    { id: "formStyle", type: "select", label: "Form Style", options: [
      { label: "Minimal (underline)", value: "minimal" },
      { label: "Bordered", value: "bordered" },
      { label: "Filled", value: "filled" },
    ], default: "minimal" },
    // Design
    { id: "bgColor", type: "text", label: "Background Color", default: "" },
    { id: "textColor", type: "text", label: "Text Color", default: "" },
    { id: "headingColor", type: "text", label: "Heading Color", default: "" },
    { id: "accentColor", type: "text", label: "Accent Color", default: "" },
    // Spacing
    { id: "paddingTop", type: "range", label: "Padding Top", min: 0, max: 120, step: 4, default: 80 },
    { id: "paddingBottom", type: "range", label: "Padding Bottom", min: 0, max: 120, step: 4, default: 80 },
    { id: "fullWidth", type: "checkbox", label: "Full Width Layout", default: false },
  ]
};

export default function ContactSection({ settings }: { settings: any }) {
  return null; // Rendering handled by storefront themes
}
