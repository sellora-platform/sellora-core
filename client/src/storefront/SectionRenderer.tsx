import Hero, { HeroSchema } from "./sections/Hero";
import FeaturedCollection, { FeaturedCollectionSchema } from "./sections/FeaturedCollection";
import ImageBanner, { ImageBannerSchema } from "./sections/ImageBanner";
import ProductDetails, { Schema as ProductDetailsSchema } from "./sections/ProductDetails";
import CartView, { Schema as CartViewSchema } from "./sections/CartView";
import CheckoutForm, { Schema as CheckoutFormSchema } from "./sections/CheckoutForm";

export const SECTION_COMPONENTS: Record<string, any> = {
  hero: Hero,
  featured_collection: FeaturedCollection,
  image_banner: ImageBanner,
  "product-details": ProductDetails,
  "cart-view": CartView,
  "checkout-form": CheckoutForm,
};

export const SECTION_SCHEMAS: Record<string, any> = {
  hero: HeroSchema,
  featured_collection: FeaturedCollectionSchema,
  image_banner: ImageBannerSchema,
  "product-details": ProductDetailsSchema,
  "cart-view": CartViewSchema,
  "checkout-form": CheckoutFormSchema,
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
