export const ReviewsSchema = {
  name: "Reviews",
  type: "reviews",
  settings: [
    { id: "title", type: "text", label: "Section Title", default: "Customer Reviews" },
    { id: "showRatingSummary", type: "checkbox", label: "Show Rating Summary", default: true },
    { id: "showReviewForm", type: "checkbox", label: "Show Review Form", default: true },
    { id: "reviewsPerPage", type: "range", label: "Reviews Per Page", min: 3, max: 20, step: 1, default: 6 },
    // Design
    { id: "bgColor", type: "text", label: "Background Color", default: "" },
    { id: "cardBgColor", type: "text", label: "Card Background Color", default: "" },
    { id: "accentColor", type: "text", label: "Accent Color (stars)", default: "" },
    // Spacing
    { id: "paddingTop", type: "range", label: "Padding Top", min: 0, max: 200, step: 4, default: 80 },
    { id: "paddingBottom", type: "range", label: "Padding Bottom", min: 0, max: 200, step: 4, default: 80 },
    { id: "fullWidth", type: "checkbox", label: "Full Width Layout", default: false },
  ]
};

export default function Reviews({ settings }: { settings: any }) {
  return (
    <section
      className="py-20 px-4 bg-background"
      style={{
        paddingTop: `${settings.paddingTop ?? 80}px`,
        paddingBottom: `${settings.paddingBottom ?? 80}px`,
        background: settings.bgColor || undefined,
      }}
    >
      <div className={settings.fullWidth ? "w-full px-6" : "container max-w-5xl mx-auto"}>
        <h2 className="text-3xl font-bold text-foreground tracking-tight text-center mb-12">
          {settings.title || "Customer Reviews"}
        </h2>

        {settings.showRatingSummary && (
          <div className="flex flex-col items-center mb-12 p-8 bg-muted/30 rounded-2xl">
            <p className="text-5xl font-bold text-foreground mb-2">5.0</p>
            <p className="text-sm text-muted-foreground">Based on 0 reviews</p>
          </div>
        )}

        <div className="text-center py-12">
          <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
        </div>

        {settings.showReviewForm && (
          <div className="mt-8 p-8 border border-border rounded-2xl">
            <h3 className="text-lg font-bold mb-6">Write a Review</h3>
            <p className="text-sm text-muted-foreground italic">Review form will appear on the live storefront.</p>
          </div>
        )}
      </div>
    </section>
  );
}
