import { db } from "./db";
import { storeThemes, stores } from "../drizzle/schema";
import { eq } from "drizzle-orm";

async function seedMarketplace() {
  console.log("Seeding marketplace themes...");

  // 1. Get an existing store to attach these themes to (as templates)
  const [firstStore] = await db.select().from(stores).limit(1);
  if (!firstStore) {
    console.error("No stores found to attach themes to. Please create a store first.");
    return;
  }

  const themesToSeed = [
    {
      name: "Lumina Fashion",
      description: "A sleek, minimalist design perfect for luxury fashion and boutique stores. Clean lines and elegant typography.",
      previewImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070",
      category: "Fashion",
      price: "0.00",
      isPublic: true,
      sections: [
        { type: "hero", settings: { heading: "New Collection 2026", subheading: "Discover the essence of elegance", alignment: "center", buttonText: "Shop Now" } },
        { type: "featured_collection", settings: { title: "Editor's Pick", columns: 3, productLimit: 6 } }
      ]
    },
    {
      name: "Organic Fresh",
      description: "Vibrant and eco-friendly layout designed for organic grocery stores and healthy lifestyle brands.",
      previewImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2000",
      category: "Grocery",
      price: "0.00",
      isPublic: true,
      sections: [
        { type: "hero", settings: { heading: "Farm to Table", subheading: "100% Organic & Pesticide Free", alignment: "left", buttonText: "View Products" } },
        { type: "image_banner", settings: { title: "Fresh Summer Sale", description: "Up to 50% off on all organic fruits.", imageUrl: "https://images.unsplash.com/photo-1610832958506-aa56338406cd?q=80&w=2070", overlayOpacity: 40 } }
      ]
    }
  ];

  for (const theme of themesToSeed) {
    await db.insert(storeThemes).values({
      storeId: firstStore.id,
      name: theme.name,
      description: theme.description,
      previewImage: theme.previewImage,
      category: theme.category,
      price: theme.price,
      isPublic: theme.isPublic,
      sections: theme.sections,
      isActive: false,
      colors: {},
      typography: {}
    });
    console.log(`Seeded theme: ${theme.name}`);
  }

  console.log("Marketplace seeding completed!");
}

seedMarketplace().catch(console.error);
