export const IconFeaturesSchema = {
  name: "Icon Features",
  type: "icon_features",
  settings: [
    // Content
    { id: "sectionTitle", type: "text", label: "Section Title", default: "Why Choose Us" },
    { id: "showTitle", type: "checkbox", label: "Show Section Title", default: false },
    { id: "feature1_icon", type: "select", label: "Feature 1 Icon", options: [
      { label: "Truck", value: "truck" }, { label: "Shield", value: "shield" },
      { label: "Refresh", value: "refresh" }, { label: "Headphones", value: "headphones" },
      { label: "Star", value: "star" }, { label: "Gift", value: "gift" },
    ], default: "truck" },
    { id: "feature1_title", type: "text", label: "Feature 1 Title", default: "Free Shipping" },
    { id: "feature1_text", type: "text", label: "Feature 1 Text", default: "On all orders over $50" },
    { id: "feature2_icon", type: "select", label: "Feature 2 Icon", options: [
      { label: "Truck", value: "truck" }, { label: "Shield", value: "shield" },
      { label: "Refresh", value: "refresh" }, { label: "Headphones", value: "headphones" },
      { label: "Star", value: "star" }, { label: "Gift", value: "gift" },
    ], default: "shield" },
    { id: "feature2_title", type: "text", label: "Feature 2 Title", default: "Secure Payment" },
    { id: "feature2_text", type: "text", label: "Feature 2 Text", default: "100% secure transactions" },
    { id: "feature3_icon", type: "select", label: "Feature 3 Icon", options: [
      { label: "Truck", value: "truck" }, { label: "Shield", value: "shield" },
      { label: "Refresh", value: "refresh" }, { label: "Headphones", value: "headphones" },
      { label: "Star", value: "star" }, { label: "Gift", value: "gift" },
    ], default: "refresh" },
    { id: "feature3_title", type: "text", label: "Feature 3 Title", default: "Easy Returns" },
    { id: "feature3_text", type: "text", label: "Feature 3 Text", default: "30-day return policy" },
    { id: "feature4_icon", type: "select", label: "Feature 4 Icon", options: [
      { label: "Truck", value: "truck" }, { label: "Shield", value: "shield" },
      { label: "Refresh", value: "refresh" }, { label: "Headphones", value: "headphones" },
      { label: "Star", value: "star" }, { label: "Gift", value: "gift" },
    ], default: "headphones" },
    { id: "feature4_title", type: "text", label: "Feature 4 Title", default: "24/7 Support" },
    { id: "feature4_text", type: "text", label: "Feature 4 Text", default: "Always here to help" },
    // Layout
    { id: "columns", type: "select", label: "Columns", options: [
      { label: "2 Columns", value: "2" },
      { label: "3 Columns", value: "3" },
      { label: "4 Columns", value: "4" },
    ], default: "4" },
    { id: "iconSize", type: "select", label: "Icon Size", options: [
      { label: "Small", value: "sm" }, { label: "Medium", value: "md" }, { label: "Large", value: "lg" },
    ], default: "md" },
    { id: "iconPosition", type: "select", label: "Icon Position", options: [
      { label: "Top", value: "top" }, { label: "Left", value: "left" },
    ], default: "top" },
    { id: "textAlignment", type: "select", label: "Text Alignment", options: [
      { label: "Left", value: "left" }, { label: "Center", value: "center" },
    ], default: "center" },
    { id: "cardStyle", type: "select", label: "Card Style", options: [
      { label: "Plain", value: "plain" }, { label: "Bordered", value: "bordered" },
      { label: "Shadow", value: "shadow" }, { label: "Filled", value: "filled" },
    ], default: "plain" },
    // Design
    { id: "bgColor", type: "text", label: "Background Color", default: "" },
    { id: "iconColor", type: "text", label: "Icon Color", default: "" },
    { id: "titleColor", type: "text", label: "Title Color", default: "" },
    { id: "textColor", type: "text", label: "Text Color", default: "" },
    { id: "cardBgColor", type: "text", label: "Card Background Color", default: "" },
    // Spacing
    { id: "paddingTop", type: "range", label: "Padding Top", min: 0, max: 120, step: 4, default: 60 },
    { id: "paddingBottom", type: "range", label: "Padding Bottom", min: 0, max: 120, step: 4, default: 60 },
    { id: "fullWidth", type: "checkbox", label: "Full Width Layout", default: false },
  ]
};

export default function IconFeatures({ settings }: { settings: any }) {
  return null; // Rendering handled by storefront themes
}
