import Hero, { HeroSchema } from "./sections/Hero";
import FeaturedCollection, { FeaturedCollectionSchema } from "./sections/FeaturedCollection";
import ImageBanner, { ImageBannerSchema } from "./sections/ImageBanner";
import ProductDetails, { Schema as ProductDetailsSchema } from "./sections/ProductDetails";
import CartView, { Schema as CartViewSchema } from "./sections/CartView";
import CheckoutForm, { Schema as CheckoutFormSchema } from "./sections/CheckoutForm";
import Testimonials, { Schema as TestimonialsSchema } from "./sections/Testimonials";
import FAQ, { Schema as FAQSchema } from "./sections/FAQ";
import Newsletter, { Schema as NewsletterSchema } from "./sections/Newsletter";
import { AnnouncementBarSchema } from "./sections/AnnouncementBar";
import { IconFeaturesSchema } from "./sections/IconFeatures";
import { BrandLogosSchema } from "./sections/BrandLogos";
import { VideoSectionSchema } from "./sections/VideoSection";
import { RichTextBlockSchema } from "./sections/RichTextBlock";
import { AboutSchema } from "./sections/AboutSection";
import { ContactSchema } from "./sections/ContactSection";
import Reviews, { ReviewsSchema } from "./sections/Reviews";
import RelatedProducts, { RelatedProductsSchema } from "./sections/RelatedProducts";

export const SECTION_COMPONENTS: Record<string, any> = {
  hero: Hero,
  featured_collection: FeaturedCollection,
  image_banner: ImageBanner,
  "product-details": ProductDetails,
  "cart-view": CartView,
  "checkout-form": CheckoutForm,
  "testimonials": Testimonials,
  "faq": FAQ,
  "newsletter": Newsletter,
  "reviews": Reviews,
  "related_products": RelatedProducts,
  "related-products": RelatedProducts,
};

export const SECTION_SCHEMAS: Record<string, any> = {
  header: {
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
  },
  footer: {
    name: "Footer",
    settings: [
      { id: "copyright_text", type: "text", label: "Copyright Text", default: "All rights reserved." },
      { id: "show_payment_icons", type: "checkbox", label: "Show Payment Icons", default: true },
      { id: "background_color", type: "select", label: "Background Scheme", options: [
        { label: "Light", value: "light" },
        { label: "Dark", value: "dark" },
        { label: "Accent", value: "accent" }
      ], default: "light" },
      { id: "instagram", type: "text", label: "Instagram URL", default: "" },
      { id: "tiktok", type: "text", label: "TikTok URL", default: "" },
      { id: "facebook", type: "text", label: "Facebook URL", default: "" },
      { id: "youtube", type: "text", label: "YouTube URL", default: "" },
      { id: "x", type: "text", label: "X (Twitter) URL", default: "" },
    ]
  },
  hero: HeroSchema,
  featured_collection: FeaturedCollectionSchema,
  image_banner: ImageBannerSchema,
  testimonials: TestimonialsSchema,
  faq: FAQSchema,
  newsletter: NewsletterSchema,
  "product-details": ProductDetailsSchema,
  "cart-view": CartViewSchema,
  "checkout-form": CheckoutFormSchema,
  
  // High-End Storefront Sections — extracted to dedicated files
  about: AboutSchema,
  contact: ContactSchema,
  announcement_bar: AnnouncementBarSchema,
  icon_features: IconFeaturesSchema,
  brand_logos: BrandLogosSchema,
  video_section: VideoSectionSchema,
  rich_text: RichTextBlockSchema,

  // Aliases — dash ↔ underscore variants for cross-compatibility
  "featured-collection": FeaturedCollectionSchema,
  "image-banner": ImageBannerSchema,
  "icon-features": IconFeaturesSchema,
  "brand-logos": BrandLogosSchema,
  "video-section": VideoSectionSchema,
  "rich-text": RichTextBlockSchema,
  checkout: CheckoutFormSchema,
  reviews: ReviewsSchema,
  related_products: RelatedProductsSchema,
  "related-products": RelatedProductsSchema,
};

export default function SectionRenderer({ 
  sections, 
  products,
  pageType = "index"
}: { 
  sections: Array<{ id: string; type: string; settings: any }>;
  products: any[];
  pageType?: string;
}) {
  if (!sections || sections.length === 0) {
    if (pageType === "product") {
      return <ProductDetails settings={{ showSocialSharing: true, showTrustBadges: true }} products={products} />;
    }
    if (pageType === "cart") {
      return <CartView settings={{ title: "Your Cart", showTrustBadges: true }} />;
    }
    if (pageType === "checkout") {
      return <CheckoutForm settings={{ heading: "Checkout" }} />;
    }

    return (
      <>
        <Hero settings={{ 
          heading: "Welcome to Our Store", 
          subheading: "Customize your storefront in the admin panel.",
          buttonText: "Shop All",
          buttonLink: "/products",
          alignment: "center",
          showTrustBadges: true
        }} />
        <FeaturedCollection 
          settings={{ title: "New Arrivals", subtitle: "Handpicked for you", columns: 4, productLimit: 8 }}
          products={products}
        />
      </>
    );
  }

  return (
    <>
      {sections.map((section) => {
        const Component = SECTION_COMPONENTS[section.type];
        if (!Component) return null;
        
        return (
          <div 
            key={section.id} 
            data-section-id={section.id} 
            className="section-wrapper relative group"
          >
            <Component id={section.id} settings={section.settings} products={products} />
            <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/30 pointer-events-none transition-all z-50" />
          </div>
        );
      })}
    </>
  );
}
