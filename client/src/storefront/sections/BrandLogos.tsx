export const BrandLogosSchema = {
  name: "Brand Logos",
  type: "brand_logos",
  settings: [
    // Content
    { id: "sectionTitle", type: "text", label: "Section Title", default: "As Featured In" },
    { id: "showTitle", type: "checkbox", label: "Show Title", default: true },
    { id: "logo1", type: "image", label: "Logo 1" },
    { id: "logo2", type: "image", label: "Logo 2" },
    { id: "logo3", type: "image", label: "Logo 3" },
    { id: "logo4", type: "image", label: "Logo 4" },
    { id: "logo5", type: "image", label: "Logo 5" },
    { id: "logo6", type: "image", label: "Logo 6" },
    { id: "logo7", type: "image", label: "Logo 7" },
    { id: "logo8", type: "image", label: "Logo 8" },
    // Layout
    { id: "columns", type: "select", label: "Columns", options: [
      { label: "3 Columns", value: "3" }, { label: "4 Columns", value: "4" },
      { label: "5 Columns", value: "5" }, { label: "6 Columns", value: "6" },
    ], default: "5" },
    { id: "logoSize", type: "select", label: "Logo Size", options: [
      { label: "Small", value: "sm" }, { label: "Medium", value: "md" }, { label: "Large", value: "lg" },
    ], default: "md" },
    { id: "grayscale", type: "checkbox", label: "Logos in Grayscale", default: true },
    { id: "hoverColor", type: "checkbox", label: "Show Color on Hover", default: true },
    // Design
    { id: "bgColor", type: "text", label: "Background Color", default: "" },
    { id: "titleColor", type: "text", label: "Title Color", default: "" },
    // Spacing
    { id: "paddingTop", type: "range", label: "Padding Top", min: 0, max: 120, step: 4, default: 60 },
    { id: "paddingBottom", type: "range", label: "Padding Bottom", min: 0, max: 120, step: 4, default: 60 },
    { id: "fullWidth", type: "checkbox", label: "Full Width Layout", default: false },
  ]
};

export default function BrandLogos({ settings }: { settings: any }) {
  return null; // Rendering handled by storefront themes
}
