export const ImageBannerSchema = {
  name: "Image Banner",
  type: "image_banner",
  settings: [
    // Content
    { id: "heading", type: "text", label: "Heading", default: "Season Sale" },
    { id: "subheading", type: "textarea", label: "Subheading", default: "Up to 50% off on all premium items." },
    { id: "showSubheading", type: "checkbox", label: "Show Subheading", default: true },
    { id: "badgeText", type: "text", label: "Badge Text", default: "Limited Time" },
    { id: "showBadge", type: "checkbox", label: "Show Badge", default: true },
    { id: "buttonText", type: "text", label: "Primary Button Text", default: "Shop Sale" },
    { id: "buttonLink", type: "url", label: "Primary Button Link", default: "/collections/all" },
    { id: "showButton", type: "checkbox", label: "Show Primary Button", default: true },
    { id: "secondaryButtonText", type: "text", label: "Secondary Button Text", default: "Learn More" },
    { id: "secondaryButtonLink", type: "url", label: "Secondary Button Link", default: "/" },
    { id: "showSecondaryButton", type: "checkbox", label: "Show Secondary Button", default: false },
    // Image
    { id: "image", type: "image", label: "Banner Image" },
    { id: "imagePosition", type: "select", label: "Image Position", options: [
      { label: "Center", value: "center" },
      { label: "Top", value: "top" },
      { label: "Bottom", value: "bottom" },
    ], default: "center" },
    { id: "overlayType", type: "select", label: "Image Overlay", options: [
      { label: "None", value: "none" },
      { label: "Dark", value: "dark" },
      { label: "Light", value: "light" },
      { label: "Gradient Bottom", value: "gradient-bottom" },
      { label: "Gradient Left", value: "gradient-left" },
    ], default: "gradient-left" },
    { id: "overlayOpacity", type: "range", label: "Overlay Opacity", min: 0, max: 100, step: 5, default: 50 },
    // Layout
    { id: "contentAlignment", type: "select", label: "Content Alignment", options: [
      { label: "Left", value: "left" },
      { label: "Center", value: "center" },
      { label: "Right", value: "right" },
    ], default: "left" },
    { id: "contentPosition", type: "select", label: "Content Position", options: [
      { label: "Top", value: "top" },
      { label: "Middle", value: "middle" },
      { label: "Bottom", value: "bottom" },
    ], default: "middle" },
    { id: "minHeight", type: "select", label: "Banner Height", options: [
      { label: "Small (40vh)", value: "40vh" },
      { label: "Medium (60vh)", value: "60vh" },
      { label: "Large (75vh)", value: "75vh" },
      { label: "Extra Large (90vh)", value: "90vh" },
      { label: "Full Screen (100vh)", value: "100vh" },
    ], default: "60vh" },
    { id: "fullWidth", type: "checkbox", label: "Full Width", default: true },
    // Typography
    { id: "headingSize", type: "select", label: "Heading Size", options: [
      { label: "Small", value: "sm" },
      { label: "Medium", value: "md" },
      { label: "Large", value: "lg" },
      { label: "Extra Large", value: "xl" },
    ], default: "lg" },
    { id: "headingColor", type: "text", label: "Heading Color", default: "" },
    { id: "subheadingColor", type: "text", label: "Subheading Color", default: "" },
    { id: "buttonStyle", type: "select", label: "Button Style", options: [
      { label: "Filled", value: "filled" },
      { label: "Outlined", value: "outlined" },
      { label: "Ghost", value: "ghost" },
    ], default: "outlined" },
    // Spacing
    { id: "paddingTop", type: "range", label: "Padding Top", min: 0, max: 120, step: 4, default: 0 },
    { id: "paddingBottom", type: "range", label: "Padding Bottom", min: 0, max: 120, step: 4, default: 0 },
  ]
};

export default function ImageBanner({ settings }: { settings: any }) {
  return null; // Rendering handled by storefront themes
}
