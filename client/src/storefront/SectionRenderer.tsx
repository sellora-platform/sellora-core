import Hero from "./sections/Hero";
import FeaturedCollection from "./sections/FeaturedCollection";

const SECTION_COMPONENTS: Record<string, any> = {
  hero: Hero,
  featured_collection: FeaturedCollection,
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
      {sections.map((section, index) => {
        const Component = SECTION_COMPONENTS[section.type];
        if (!Component) return null;
        return <Component key={index} settings={section.settings} products={products} />;
      })}
    </>
  );
}
