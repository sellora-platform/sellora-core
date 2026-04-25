import Hero, { HeroSchema } from "./sections/Hero";
import FeaturedCollection, { FeaturedCollectionSchema } from "./sections/FeaturedCollection";
import ImageBanner, { ImageBannerSchema } from "./sections/ImageBanner";

export const SECTION_COMPONENTS: Record<string, any> = {
  hero: Hero,
  featured_collection: FeaturedCollection,
  image_banner: ImageBanner,
};

export const SECTION_SCHEMAS: Record<string, any> = {
  hero: HeroSchema,
  featured_collection: FeaturedCollectionSchema,
  image_banner: ImageBannerSchema,
};

export default function SectionRenderer({ 
  sections, 
  products 
}: { 
  sections: Array<{ type: string; settings: any }>;
  products: any[];
}) {
  if (!sections || sections.length === 0) {
    // Default sections if none defined
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
        return <Component key={section.id} id={section.id} settings={section.settings} products={products} />;
      })}
    </>
  );
}
