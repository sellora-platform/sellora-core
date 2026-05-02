import Hero, { HeroSchema } from "./sections/Hero";
import FeaturedCollection, { FeaturedCollectionSchema } from "./sections/FeaturedCollection";
import ImageBanner, { ImageBannerSchema } from "./sections/ImageBanner";
import ProductDetails, { Schema as ProductDetailsSchema } from "./sections/ProductDetails";
import CartView, { Schema as CartViewSchema } from "./sections/CartView";
import CheckoutForm, { Schema as CheckoutFormSchema } from "./sections/CheckoutForm";
import Testimonials, { Schema as TestimonialsSchema } from "./sections/Testimonials";
import FAQ, { Schema as FAQSchema } from "./sections/FAQ";
import Newsletter, { Schema as NewsletterSchema } from "./sections/Newsletter";

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
      ], default: "light" }
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
  
  // High-End Storefront Sections
  about: {
    name: "About",
    type: "about",
    settings: [
      { id: "heading", type: "text", label: "Heading", default: "Our Story" },
      { id: "body", type: "richtext", label: "Body Text", default: "<p>We believe in quality over quantity. Every product is carefully crafted with purpose and intention.</p>" },
      { id: "image", type: "image", label: "Image" },
      { id: "imagePosition", type: "select", label: "Image Position", options: [
        { label: "Left", value: "left" },
        { label: "Right", value: "right" }
      ], default: "right" }
    ]
  },
  contact: {
    name: "Contact",
    type: "contact",
    settings: [
      { id: "heading", type: "text", label: "Heading", default: "Get In Touch" },
      { id: "subtitle", type: "text", label: "Subtitle", default: "We'd love to hear from you." },
      { id: "email", type: "text", label: "Contact Email", default: "hello@store.com" }
    ]
  },
  announcement_bar: {
    name: "Announcement Bar",
    type: "announcement_bar",
    settings: [
      { id: "text", type: "text", label: "Message", default: "Free shipping on orders over $50 — Shop Now" },
      { id: "link", type: "url", label: "Link", default: "/products" },
      { id: "bgColor", type: "text", label: "Background Color", default: "#18181b" },
      { id: "textColor", type: "text", label: "Text Color", default: "#ffffff" },
      { id: "dismissible", type: "checkbox", label: "Dismissible", default: true }
    ]
  },
  icon_features: {
    name: "Icon Features",
    type: "icon_features",
    settings: [
      { id: "feature1_icon", type: "select", label: "Feature 1 Icon", options: [
        { label: "Truck", value: "truck" },
        { label: "Shield", value: "shield" },
        { label: "RefreshCw", value: "refresh" },
        { label: "Headphones", value: "headphones" },
        { label: "Star", value: "star" },
        { label: "Gift", value: "gift" }
      ], default: "truck" },
      { id: "feature1_title", type: "text", label: "Feature 1 Title", default: "Free Shipping" },
      { id: "feature1_text", type: "text", label: "Feature 1 Text", default: "On all orders over $50" },
      { id: "feature2_icon", type: "select", label: "Feature 2 Icon", options: [
        { label: "Truck", value: "truck" },
        { label: "Shield", value: "shield" },
        { label: "RefreshCw", value: "refresh" },
        { label: "Headphones", value: "headphones" },
        { label: "Star", value: "star" },
        { label: "Gift", value: "gift" }
      ], default: "shield" },
      { id: "feature2_title", type: "text", label: "Feature 2 Title", default: "Secure Payment" },
      { id: "feature3_icon", type: "select", label: "Feature 3 Icon", options: [
        { label: "Truck", value: "truck" },
        { label: "Shield", value: "shield" },
        { label: "RefreshCw", value: "refresh" },
        { label: "Headphones", value: "headphones" }
      ], default: "refresh" },
      { id: "feature3_title", type: "text", label: "Feature 3 Title", default: "Easy Returns" },
    ]
  },
  brand_logos: {
    name: "Brand Logos",
    type: "brand_logos",
    settings: [
      { id: "heading", type: "text", label: "Heading", default: "As Featured In" },
      { id: "logo1", type: "image", label: "Logo 1" },
      { id: "logo2", type: "image", label: "Logo 2" },
      { id: "logo3", type: "image", label: "Logo 3" },
      { id: "logo4", type: "image", label: "Logo 4" },
      { id: "logo5", type: "image", label: "Logo 5" }
    ]
  },
  video_section: {
    name: "Video Section",
    type: "video_section",
    settings: [
      { id: "heading", type: "text", label: "Heading", default: "See It In Action" },
      { id: "subtitle", type: "text", label: "Subtitle", default: "Watch how our products transform your everyday routine." },
      { id: "videoUrl", type: "url", label: "YouTube/Vimeo URL", default: "" },
      { id: "aspectRatio", type: "select", label: "Aspect Ratio", options: [
        { label: "16:9", value: "16/9" },
        { label: "4:3", value: "4/3" },
        { label: "1:1", value: "1/1" }
      ], default: "16/9" }
    ]
  },
  rich_text: {
    name: "Rich Text",
    type: "rich_text",
    settings: [
      { id: "content", type: "richtext", label: "Content", default: "<h2>Your Story Starts Here</h2><p>Use this space to share your brand's mission, values, or any message that connects with your audience.</p>" },
      { id: "alignment", type: "select", label: "Alignment", options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" }
      ], default: "center" },
      { id: "maxWidth", type: "select", label: "Width", options: [
        { label: "Narrow", value: "max-w-2xl" },
        { label: "Medium", value: "max-w-4xl" },
        { label: "Wide", value: "max-w-6xl" }
      ], default: "max-w-2xl" }
    ]
  },
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
