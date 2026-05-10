/**
 * SECTION_REGISTRY — Central registry of all available section types.
 * 
 * The new modular editor (apps/dashboard/src/editor/) imports from this file.
 * Each entry maps a section type key to { component, schema }.
 */
import Hero, { HeroSchema } from "../storefront/sections/Hero";
import FeaturedCollection, { FeaturedCollectionSchema } from "../storefront/sections/FeaturedCollection";
import ImageBanner, { ImageBannerSchema } from "../storefront/sections/ImageBanner";
import Testimonials, { Schema as TestimonialsSchema } from "../storefront/sections/Testimonials";
import FAQ, { Schema as FAQSchema } from "../storefront/sections/FAQ";
import Newsletter, { Schema as NewsletterSchema } from "../storefront/sections/Newsletter";
import ProductDetails, { Schema as ProductDetailsSchema } from "../storefront/sections/ProductDetails";
import CartView, { Schema as CartViewSchema } from "../storefront/sections/CartView";
import CheckoutForm, { Schema as CheckoutFormSchema } from "../storefront/sections/CheckoutForm";
import AboutSection, { AboutSchema } from "../storefront/sections/AboutSection";
import ContactSection, { ContactSchema } from "../storefront/sections/ContactSection";
import AnnouncementBar, { AnnouncementBarSchema } from "../storefront/sections/AnnouncementBar";
import IconFeatures, { IconFeaturesSchema } from "../storefront/sections/IconFeatures";
import BrandLogos, { BrandLogosSchema } from "../storefront/sections/BrandLogos";
import VideoSection, { VideoSectionSchema } from "../storefront/sections/VideoSection";
import RichTextBlock, { RichTextBlockSchema } from "../storefront/sections/RichTextBlock";
import Reviews, { ReviewsSchema } from "../storefront/sections/Reviews";
import RelatedProducts, { RelatedProductsSchema } from "../storefront/sections/RelatedProducts";

// Inline schemas for layout-level sections (no dedicated component files)
const HeaderSchema = {
  name: "Header",
  settings: [
    { id: "logo", type: "image", label: "Logo Image" },
    { id: "sticky", type: "checkbox", label: "Sticky Header", default: true },
    { id: "menu_alignment", type: "select", label: "Menu Alignment", options: [
      { label: "Left", value: "left" },
      { label: "Center", value: "center" },
      { label: "Right", value: "right" }
    ], default: "right" }
  ]
};

const FooterSchema = {
  name: "Footer",
  settings: [
    { id: "copyright_text", type: "text", label: "Copyright Text", default: "All rights reserved." },
    { id: "show_payment_icons", type: "checkbox", label: "Show Payment Icons", default: true },
    { id: "background_color", type: "select", label: "Background Scheme", options: [
      { label: "Light", value: "light" },
      { label: "Dark", value: "dark" },
      { label: "Accent", value: "accent" }
    ], default: "light" }
  ]
};

export const SECTION_REGISTRY: Record<string, { component: React.FC<any>; schema: any }> = {
  // Layout Sections (schema-only, no preview component)
  header: {
    component: () => null,
    schema: HeaderSchema,
  },
  footer: {
    component: () => null,
    schema: FooterSchema,
  },

  // Core Sections
  hero: {
    component: Hero,
    schema: HeroSchema,
  },
  featured_collection: {
    component: FeaturedCollection,
    schema: FeaturedCollectionSchema,
  },
  image_banner: {
    component: ImageBanner,
    schema: ImageBannerSchema,
  },
  testimonials: {
    component: Testimonials,
    schema: TestimonialsSchema,
  },
  faq: {
    component: FAQ,
    schema: FAQSchema,
  },
  newsletter: {
    component: Newsletter,
    schema: NewsletterSchema,
  },
  "product-details": {
    component: ProductDetails,
    schema: ProductDetailsSchema,
  },
  "cart-view": {
    component: CartView,
    schema: CartViewSchema,
  },
  "checkout-form": {
    component: CheckoutForm,
    schema: CheckoutFormSchema,
  },
  checkout: {
    component: CheckoutForm,
    schema: CheckoutFormSchema,
  },

  // High-End Storefront Sections
  about: {
    component: AboutSection,
    schema: AboutSchema,
  },
  contact: {
    component: ContactSection,
    schema: ContactSchema,
  },
  announcement_bar: {
    component: AnnouncementBar,
    schema: AnnouncementBarSchema,
  },
  icon_features: {
    component: IconFeatures,
    schema: IconFeaturesSchema,
  },
  brand_logos: {
    component: BrandLogos,
    schema: BrandLogosSchema,
  },
  video_section: {
    component: VideoSection,
    schema: VideoSectionSchema,
  },
  rich_text: {
    component: RichTextBlock,
    schema: RichTextBlockSchema,
  },

  // Newly Added Sections
  reviews: {
    component: Reviews,
    schema: ReviewsSchema,
  },
  related_products: {
    component: RelatedProducts,
    schema: RelatedProductsSchema,
  },

  // ─── Aliases (dash ↔ underscore) for cross-compatibility ───
  "featured-collection": {
    component: FeaturedCollection,
    schema: FeaturedCollectionSchema,
  },
  "image-banner": {
    component: ImageBanner,
    schema: ImageBannerSchema,
  },
  "icon-features": {
    component: IconFeatures,
    schema: IconFeaturesSchema,
  },
  "brand-logos": {
    component: BrandLogos,
    schema: BrandLogosSchema,
  },
  "video-section": {
    component: VideoSection,
    schema: VideoSectionSchema,
  },
  "rich-text": {
    component: RichTextBlock,
    schema: RichTextBlockSchema,
  },
  "related-products": {
    component: RelatedProducts,
    schema: RelatedProductsSchema,
  },
};
