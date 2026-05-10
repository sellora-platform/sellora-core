export const RelatedProductsSchema = {
  name: "Related Products",
  type: "related_products",
  settings: [
    { id: "title", type: "text", label: "Section Title", default: "You May Also Like" },
    { id: "limit", type: "range", label: "Products to Show", min: 2, max: 8, step: 1, default: 4 },
    // Layout
    { id: "columns", type: "select", label: "Columns", options: [
      { label: "2 Columns", value: "2" },
      { label: "3 Columns", value: "3" },
      { label: "4 Columns", value: "4" },
    ], default: "4" },
    { id: "cardStyle", type: "select", label: "Card Style", options: [
      { label: "Minimal", value: "minimal" },
      { label: "Bordered", value: "bordered" },
      { label: "Shadow", value: "shadow" },
    ], default: "minimal" },
    { id: "showPrice", type: "checkbox", label: "Show Price", default: true },
    { id: "showComparePrice", type: "checkbox", label: "Show Compare Price", default: true },
    // Design
    { id: "bgColor", type: "text", label: "Background Color", default: "" },
    { id: "titleColor", type: "text", label: "Title Color", default: "" },
    // Spacing
    { id: "paddingTop", type: "range", label: "Padding Top", min: 0, max: 200, step: 4, default: 80 },
    { id: "paddingBottom", type: "range", label: "Padding Bottom", min: 0, max: 200, step: 4, default: 80 },
    { id: "fullWidth", type: "checkbox", label: "Full Width Layout", default: false },
  ]
};

export default function RelatedProducts({ settings }: { settings: any }) {
  return (
    <section
      className="py-20 px-4 bg-background border-t border-border/50"
      style={{
        paddingTop: `${settings.paddingTop ?? 80}px`,
        paddingBottom: `${settings.paddingBottom ?? 80}px`,
        background: settings.bgColor || undefined,
      }}
    >
      <div className={settings.fullWidth ? "w-full px-6" : "container mx-auto"}>
        <div className="flex items-end justify-between mb-12">
          <h2
            className="text-3xl font-bold text-foreground tracking-tight"
            style={{ color: settings.titleColor || undefined }}
          >
            {settings.title || "You May Also Like"}
          </h2>
        </div>

        <div className={`grid grid-cols-2 lg:grid-cols-${settings.columns || 4} gap-6`}>
          {Array.from({ length: settings.limit || 4 }).map((_, i) => (
            <div key={i} className="group">
              <div className="aspect-[3/4] bg-muted/30 rounded-xl mb-4 flex items-center justify-center">
                <span className="text-xs text-muted-foreground uppercase tracking-widest">Product {i + 1}</span>
              </div>
              <p className="text-sm font-medium text-foreground mb-1">Product Name</p>
              {settings.showPrice && (
                <p className="text-sm text-muted-foreground">$0.00</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
