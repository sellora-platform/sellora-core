import { z } from "zod";
import { protectedProcedure, auditedProcedure, publicProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { addDomainToVercel, verifyDomainOnVercel } from "../_core/vercel-api";
import { ENV } from "../_core/env";
import { canAccess } from "../utils/capabilities";
import { SubscriptionTier } from "../utils/featureRegistry";
import { UsageEngine } from "../utils/usage";
import { MerchantExperienceEngine } from "../utils/merchantExperience";

export const storesRouter = router({
  // Create a new store for the merchant
  create: auditedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Store name is required"),
        slug: z.string().min(1, "Store slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 1. Centralized Backend Enforcement
      console.log("Creating store for user:", ctx.user.id, ctx.user.tier);
      await canAccess.createStore(ctx.user.id, ctx.user.tier as SubscriptionTier);

      // 2. Check if slug is already taken
      const existing = await db.getStoreBySlug(input.slug);
      if (existing) {
        throw new Error("This Store ID is already taken. Please choose another one.");
      }

      try {
        const store = await db.createStore({
          merchantId: ctx.user.id,
          name: input.name,
          slug: input.slug,
          description: input.description,
        });

        // AUTOMATION: Add slug.platformRoot (e.g. wazewear.raaenai.com) to Vercel project
        const fullSubdomain = `${input.slug}.${ENV.platformRoot}`;
        // We MUST await this on Vercel or the function will terminate before the API call finishes
        await addDomainToVercel(fullSubdomain).catch(err => console.error("Vercel automation failed:", err));

        // Create the Default Theme (Dawn equivalent) for this store
        const defaultThemeId = crypto.randomUUID();
        const defaultThemeJson = {
          colors: { 
            primary: "#0f172a", 
            background: "#ffffff", 
            accent: "#008060", // Shopify-like Green
            foreground: "#0f172a"
          },
          typography: { family: "Outfit" },
          header: {
            id: "header",
            type: "header",
            settings: {
              menu_alignment: "right",
              sticky: true,
              logo: ""
            }
          },
          footer: {
            id: "footer",
            type: "footer",
            settings: {
              background_color: "light",
              copyright_text: `© ${new Date().getFullYear()} ${input.name}`,
              show_payment_icons: true
            }
          },
          templates: {
            index: {
              order: ["hero-1", "products-1"],
              sections: {
                "hero-1": { 
                  type: "hero", 
                  settings: { 
                    heading: `Elevate Your Store`, 
                    subheading: `Welcome to ${input.name}. Discover our curated collection of premium goods.`, 
                    showButton: true, 
                    buttonText: "Shop Collection",
                    buttonLink: "/products",
                    alignment: "center"
                  } 
                },
                "products-1": { 
                  type: "featured_collection", 
                  settings: { 
                    limit: 4, 
                    title: "Featured Favorites", 
                    subtitle: "Handpicked for you",
                    columns: 4 
                  } 
                }
              }
            },
            product: {
              order: ["product-main"],
              sections: {
                "product-main": { 
                  type: "product-details", 
                  settings: { 
                    showSocialSharing: true,
                    showTrustBadges: true
                  } 
                }
              }
            },
            cart: {
              order: ["cart-main"],
              sections: {
                "cart-main": { 
                  type: "cart-view", 
                  settings: { 
                    title: "Your Shopping Bag",
                    showTrustBadges: true
                  } 
                }
              }
            },
            about: {
              order: ["about-hero"],
              sections: {
                "about-hero": { 
                  type: "hero", 
                  settings: { 
                    heading: "Our Story", 
                    subheading: "Learn more about our mission and values.", 
                    showButton: false,
                    alignment: "center"
                  } 
                }
              }
            },
            contact: {
              order: ["contact-hero"],
              sections: {
                "contact-hero": { 
                  type: "hero", 
                  settings: { 
                    heading: "Get in Touch", 
                    subheading: "We'd love to hear from you. Send us a message below.", 
                    showButton: false,
                    alignment: "center"
                  } 
                }
              }
            }
          }
        };

        await db.createStoreTheme({
          id: defaultThemeId,
          storeId: store.id,
          name: "Dawn (Default)",
          draftConfig: defaultThemeJson,
          publishedConfig: defaultThemeJson,
          isActive: true,
          schemaVersion: 1,
        }).catch(err => console.error("Failed to create default theme:", err));

        // 3. Usage Tracking
        await UsageEngine.increment(ctx.user.id, "stores_count");

        // 4. Merchant Activation Tracking
        await MerchantExperienceEngine.trackActivation(ctx.user.id, "hasCreatedStore");

        return store;
      } catch (err: any) {
        console.error("STORE CREATE REAL ERROR:", err);
        throw new Error(err.message || "Failed to create store. Please try again.");
      }
    }),

  // Get the merchant's stores
  getMyStores: protectedProcedure.query(async ({ ctx }) => {
    return db.getStoresByMerchantId(ctx.user.id);
  }),

  // Get the primary store (for compatibility)
  getMyStore: protectedProcedure.query(async ({ ctx }) => {
    return db.getStoreByMerchantId(ctx.user.id);
  }),

  // Get a store by slug (public)
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const store = await db.getStoreBySlug(input.slug);
      if (store) {
        const themes = await db.getThemesByStoreId(store.id);
        const activeTheme = themes.find(t => t.isActive) || themes[0] || null;
        const channels = await db.getChannelsByStoreId(store.id);
        return { ...store, activeTheme, channels };
      }
      return null;
    }),

  // Get a store by custom domain (public)
  getByDomain: publicProcedure
    .input(z.object({ domain: z.string() }))
    .query(async ({ input }) => {
      const store = await db.getStoreByDomain(input.domain);
      if (store) {
        const themes = await db.getThemesByStoreId(store.id);
        const activeTheme = themes.find(t => t.isActive) || themes[0] || null;
        const channels = await db.getChannelsByStoreId(store.id);
        return { ...store, activeTheme, channels };
      }
      return null;
    }),

  // Update store settings
  update: auditedProcedure
    .input(
      z.object({
        storeId: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        logo: z.string().optional(),
        favicon: z.string().optional(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        accentColor: z.string().optional(),
        fontFamily: z.string().optional(),
        theme: z.enum(["light", "dark", "auto"]).optional(),
        customDomain: z.string().nullable().optional(),
        autoOrderEmail: z.boolean().optional(),
        autoContactReply: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { storeId, ...updateData } = input;
      
      // Transform empty string to null to avoid unique constraint violations
      if (updateData.customDomain === "") {
        updateData.customDomain = null;
      }
      
      // 1. Verify ownership
      const currentStore = await db.getStoreByMerchantId(ctx.user.id);
      if (!currentStore || currentStore.id !== storeId) {
        throw new Error("Unauthorized");
      }

      // 2. Feature Gating: Custom Domains
      if (updateData.customDomain !== undefined && updateData.customDomain !== currentStore.customDomain) {
        canAccess.feature(ctx.user.tier as SubscriptionTier, "customDomains");
        
        // AUTOMATION: If custom domain is being added/changed, register it on Vercel
        if (updateData.customDomain) {
           await addDomainToVercel(updateData.customDomain).catch(err => console.error("Vercel custom domain automation failed:", err));
        } else if (currentStore.customDomain && updateData.customDomain === null) {
           // Wait, how do we remove it? The vercel-api has removeDomainFromVercel!
           // Let's call it!
           const { removeDomainFromVercel } = await import("../_core/vercel-api");
           await removeDomainFromVercel(currentStore.customDomain).catch(err => console.error("Vercel domain removal failed:", err));
        }
      }

      return db.updateStore(storeId, updateData);
    }),

  // Verify custom domain status with Vercel
  verifyDomain: auditedProcedure
    .input(z.object({ storeId: z.number(), domain: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // 1. Verify ownership
      const currentStore = await db.getStoreByMerchantId(ctx.user.id);
      if (!currentStore || currentStore.id !== input.storeId || currentStore.customDomain !== input.domain) {
        throw new Error("Unauthorized or domain mismatch");
      }

      // 2. Call Vercel API
      const result = await verifyDomainOnVercel(input.domain);
      
      return result;
    }),

  // ─── Tracking Pixels ──────────────────────────────────────

  // Get tracking pixel configuration
  getTrackingPixels: protectedProcedure
    .input(z.object({ storeId: z.number() }))
    .query(async ({ input, ctx }) => {
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }
      return (store as any).trackingPixels || {};
    }),

  // Update tracking pixel configuration
  updateTrackingPixels: auditedProcedure
    .input(z.object({
      storeId: z.number(),
      pixels: z.object({
        metaPixelId: z.string().optional(),
        metaAccessToken: z.string().optional(),
        tiktokPixelId: z.string().optional(),
        tiktokAccessToken: z.string().optional(),
        ga4MeasurementId: z.string().optional(),
        googleAdsId: z.string().optional(),
        snapchatPixelId: z.string().optional(),
        pinterestTagId: z.string().optional(),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }

      // Clean empty strings to undefined
      const cleaned: Record<string, string | undefined> = {};
      for (const [key, value] of Object.entries(input.pixels)) {
        cleaned[key] = value?.trim() || undefined;
      }

      await db.updateStore(input.storeId, { trackingPixels: cleaned } as any);
      return { success: true };
    }),

  // PUBLIC — Get pixels for storefront injection
  getPublicPixels: publicProcedure
    .input(z.object({ storeId: z.number() }))
    .query(async ({ input }) => {
      const store = await db.getStoreById(input.storeId);
      if (!store) return {};
      const pixels = (store as any).trackingPixels || {};
      // Only return pixel IDs, never access tokens (security)
      return {
        metaPixelId: pixels.metaPixelId,
        tiktokPixelId: pixels.tiktokPixelId,
        ga4MeasurementId: pixels.ga4MeasurementId,
        googleAdsId: pixels.googleAdsId,
        snapchatPixelId: pixels.snapchatPixelId,
        pinterestTagId: pixels.pinterestTagId,
      };
    }),
});
