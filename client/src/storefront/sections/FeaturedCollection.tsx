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
    {
      id: "title",
      type: "text",
      label: "Heading",
      default: "Featured Products"
    },
    {
      id: "subtitle",
      type: "text",
      label: "Subheading",
      default: "Selected specifically for you"
    },
    {
      id: "columns",
      type: "range",
      label: "Columns on desktop",
      min: 2,
      max: 4,
      default: 4
    },
    {
      id: "productLimit",
      type: "range",
      label: "Product limit",
      min: 4,
      max: 12,
      default: 8
    }
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
