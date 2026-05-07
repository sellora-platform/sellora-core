import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Star, Package } from "lucide-react";

export type FeaturedCollectionSettings = {
  title: string;
  subtitle: string;
  columns: 2 | 3 | 4;
  productLimit: number;
};

export const FeaturedCollectionSchema = {
  name: "Featured Collection",
  type: "featured_collection",
  settings: [
    // Content
    { id: "sectionTitle", type: "text", label: "Section Title", default: "Shop the Collection" },
    { id: "sectionSubtitle", type: "textarea", label: "Section Subtitle", default: "Handpicked essentials crafted for modern living." },
    { id: "showSubtitle", type: "checkbox", label: "Show Subtitle", default: true },
    { id: "viewAllText", type: "text", label: "View All Button Text", default: "View All" },
    { id: "viewAllLink", type: "url", label: "View All Link", default: "/products" },
    { id: "showViewAll", type: "checkbox", label: "Show View All Button", default: true },
    // Layout
    { id: "columns", type: "select", label: "Columns", options: [
      { label: "2 Columns", value: "2" },
      { label: "3 Columns", value: "3" },
      { label: "4 Columns", value: "4" },
    ], default: "4" },
    { id: "rows", type: "select", label: "Max Rows", options: [
      { label: "1 Row", value: "1" },
      { label: "2 Rows", value: "2" },
      { label: "3 Rows", value: "3" },
    ], default: "1" },
    { id: "cardStyle", type: "select", label: "Card Style", options: [
      { label: "Minimal", value: "minimal" },
      { label: "Bordered", value: "bordered" },
      { label: "Shadow", value: "shadow" },
      { label: "Elevated", value: "elevated" },
    ], default: "minimal" },
    { id: "imageAspectRatio", type: "select", label: "Image Aspect Ratio", options: [
      { label: "Square (1:1)", value: "square" },
      { label: "Portrait (4:5)", value: "portrait" },
      { label: "Landscape (16:9)", value: "landscape" },
      { label: "Auto", value: "auto" },
    ], default: "portrait" },
    { id: "showProductTitle", type: "checkbox", label: "Show Product Title", default: true },
    { id: "showPrice", type: "checkbox", label: "Show Price", default: true },
    { id: "showComparePrice", type: "checkbox", label: "Show Compare Price", default: true },
    { id: "showAddToCart", type: "checkbox", label: "Show Add to Cart", default: true },
    { id: "showBadges", type: "checkbox", label: "Show Sale/New Badges", default: true },
    // Design
    { id: "bgColor", type: "text", label: "Background Color", default: "" },
    { id: "titleColor", type: "text", label: "Title Color", default: "" },
    { id: "cardBgColor", type: "text", label: "Card Background Color", default: "" },
    { id: "buttonStyle", type: "select", label: "Button Style", options: [
      { label: "Filled", value: "filled" },
      { label: "Outlined", value: "outlined" },
      { label: "Ghost", value: "ghost" },
    ], default: "filled" },
    // Spacing
    { id: "paddingTop", type: "range", label: "Padding Top", min: 0, max: 120, step: 4, default: 80 },
    { id: "paddingBottom", type: "range", label: "Padding Bottom", min: 0, max: 120, step: 4, default: 80 },
    { id: "fullWidth", type: "checkbox", label: "Full Width Layout", default: false },
  ]
};


export default function FeaturedCollection({ settings, products }: { settings: FeaturedCollectionSettings, products: any[] }) {
  const gridClass = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }[settings.columns || 4];

  return (
    <section className="py-24 px-4 bg-background">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              {settings.title || "Featured Products"}
            </h2>
            <p className="text-foreground/50 mt-2 text-lg">
              {settings.subtitle || "Selected specifically for you"}
            </p>
          </div>
          <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5">
            View All Collection →
          </Button>
        </div>

        {products.length === 0 ? (
          <Card className="p-24 border-dashed text-center">
            <Package className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
            <p className="text-foreground/40 font-medium italic text-lg">No products to display.</p>
          </Card>
        ) : (
          <div className={`grid ${gridClass} gap-8`}>
            {products.slice(0, settings.productLimit || 8).map((product) => (
              <Card
                key={product.id}
                className="group border-border/50 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-card/50 backdrop-blur-sm"
              >
                <div className="relative aspect-square bg-accent/5 overflow-hidden">
                   {/* Product Image logic... */}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-6 space-y-4">
                  <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-foreground">
                      ${product.price}
                    </span>
                    <Button size="sm" className="rounded-lg bg-foreground text-background hover:bg-primary hover:text-primary-foreground transition-all">
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
