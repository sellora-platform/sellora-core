import { Button } from "@/components/ui/button";

export type ImageBannerSettings = {
  title: string;
  description: string;
  imageUrl: string;
  overlayOpacity: number;
  contentPosition: "left" | "center" | "right";
  buttonText: string;
};

export const ImageBannerSchema = {
  name: "Image Banner",
  type: "image_banner",
  settings: [
    {
      id: "imageUrl",
      type: "text",
      label: "Image URL",
      default: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070"
    },
    {
      id: "title",
      type: "text",
      label: "Title",
      default: "Summer Collection"
    },
    {
      id: "description",
      type: "textarea",
      label: "Description",
      default: "Experience the best of summer with our new arrivals."
    },
    {
      id: "overlayOpacity",
      type: "range",
      label: "Overlay Opacity (%)",
      min: 0,
      max: 90,
      default: 40
    },
    {
      id: "contentPosition",
      type: "select",
      label: "Content Position",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" }
      ],
      default: "center"
    },
    {
      id: "buttonText",
      type: "text",
      label: "Button Text",
      default: "Shop Collection"
    }
  ]
};

export default function ImageBanner({ settings }: { settings: ImageBannerSettings }) {
  const positionClass = {
    left: "justify-start text-left",
    center: "justify-center text-center",
    right: "justify-end text-right"
  }[settings.contentPosition || "center"];

  return (
    <section className="relative h-[600px] flex items-center overflow-hidden">
      {/* Background Image */}
      <img 
        src={settings.imageUrl} 
        alt={settings.title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black" 
        style={{ opacity: (settings.overlayOpacity || 40) / 100 }}
      />

      {/* Content */}
      <div className={`container relative z-10 flex ${positionClass}`}>
        <div className="max-w-2xl text-white space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
            {settings.title}
          </h2>
          <p className="text-xl text-white/80">
            {settings.description}
          </p>
          <Button size="lg" className="h-14 px-10 rounded-xl font-bold bg-white text-black hover:bg-white/90">
            {settings.buttonText}
          </Button>
        </div>
      </div>
    </section>
  );
}
