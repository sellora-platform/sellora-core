import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { shippingZones, shippingRates, shippingCarrierSettings } from "../../db/schema";
import { eq, and } from "drizzle-orm";

export const shippingRouter = router({
  // ─── List Zones and Rates ────────────────────────────────────
  listZones: protectedProcedure
    .input(z.object({ storeId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Fetch zones
      const zonesList = await db.select().from(shippingZones)
        .where(eq(shippingZones.storeId, input.storeId));

      // Fetch rates for all zones
      const result = [];
      for (const zone of zonesList) {
        const ratesList = await db.select().from(shippingRates)
          .where(eq(shippingRates.zoneId, zone.id));
        result.push({
          ...zone,
          rates: ratesList,
        });
      }
      return result;
    }),

  // ─── Create Zone ─────────────────────────────────────────────
  createZone: protectedProcedure
    .input(
      z.object({
        storeId: z.number(),
        name: z.string().min(1),
        countries: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const [newZone] = await db.insert(shippingZones).values({
        storeId: input.storeId,
        name: input.name,
        countries: input.countries,
      }).returning();
      return newZone;
    }),

  // ─── Update Zone ─────────────────────────────────────────────
  updateZone: protectedProcedure
    .input(
      z.object({
        zoneId: z.number(),
        storeId: z.number(),
        name: z.string().min(1),
        countries: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const [updatedZone] = await db.update(shippingZones)
        .set({
          name: input.name,
          countries: input.countries,
          updatedAt: new Date(),
        })
        .where(eq(shippingZones.id, input.zoneId))
        .returning();
      return updatedZone;
    }),

  // ─── Delete Zone ─────────────────────────────────────────────
  deleteZone: protectedProcedure
    .input(z.object({ zoneId: z.number(), storeId: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(shippingZones)
        .where(eq(shippingZones.id, input.zoneId));
      return { success: true };
    }),

  // ─── Create Rate ─────────────────────────────────────────────
  createRate: protectedProcedure
    .input(
      z.object({
        zoneId: z.number(),
        name: z.string().min(1),
        type: z.string(), // "flat" | "weight_based" | "price_based"
        price: z.number(),
        minLimit: z.number().nullable().optional(),
        maxLimit: z.number().nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [newRate] = await db.insert(shippingRates).values({
        zoneId: input.zoneId,
        name: input.name,
        type: input.type,
        price: String(input.price),
        minLimit: input.minLimit !== undefined ? String(input.minLimit) : null,
        maxLimit: input.maxLimit !== undefined ? String(input.maxLimit) : null,
      }).returning();
      return newRate;
    }),

  // ─── Update Rate ─────────────────────────────────────────────
  updateRate: protectedProcedure
    .input(
      z.object({
        rateId: z.number(),
        name: z.string().min(1),
        type: z.string(),
        price: z.number(),
        minLimit: z.number().nullable().optional(),
        maxLimit: z.number().nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [updatedRate] = await db.update(shippingRates)
        .set({
          name: input.name,
          type: input.type,
          price: String(input.price),
          minLimit: input.minLimit !== undefined ? (input.minLimit !== null ? String(input.minLimit) : null) : undefined,
          maxLimit: input.maxLimit !== undefined ? (input.maxLimit !== null ? String(input.maxLimit) : null) : undefined,
          updatedAt: new Date(),
        })
        .where(eq(shippingRates.id, input.rateId))
        .returning();
      return updatedRate;
    }),

  // ─── Delete Rate ─────────────────────────────────────────────
  deleteRate: protectedProcedure
    .input(z.object({ rateId: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(shippingRates)
        .where(eq(shippingRates.id, input.rateId));
      return { success: true };
    }),

  // ─── Get Carrier Settings ────────────────────────────────────
  getCarrierSettings: protectedProcedure
    .input(z.object({ storeId: z.number() }))
    .query(async ({ input }) => {
      return db.select().from(shippingCarrierSettings)
        .where(eq(shippingCarrierSettings.storeId, input.storeId));
    }),

  // ─── Update Carrier Settings ─────────────────────────────────
  updateCarrierSettings: protectedProcedure
    .input(
      z.object({
        storeId: z.number(),
        carrier: z.string(), // "easypost", "shipstation", "leopard", "tcs"
        apiKey: z.string().optional(),
        apiSecret: z.string().optional(),
        isEnabled: z.boolean(),
        settings: z.any().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const existing = await db.select().from(shippingCarrierSettings)
        .where(
          and(
            eq(shippingCarrierSettings.storeId, input.storeId),
            eq(shippingCarrierSettings.carrier, input.carrier)
          )
        ).limit(1);

      if (existing.length > 0) {
        const [updated] = await db.update(shippingCarrierSettings)
          .set({
            apiKey: input.apiKey ?? existing[0].apiKey,
            apiSecret: input.apiSecret ?? existing[0].apiSecret,
            isEnabled: input.isEnabled,
            settings: input.settings ?? existing[0].settings,
            updatedAt: new Date(),
          })
          .where(eq(shippingCarrierSettings.id, existing[0].id))
          .returning();
        return updated;
      } else {
        const [inserted] = await db.insert(shippingCarrierSettings).values({
          storeId: input.storeId,
          carrier: input.carrier,
          apiKey: input.apiKey || "",
          apiSecret: input.apiSecret || "",
          isEnabled: input.isEnabled,
          settings: input.settings || {},
        }).returning();
        return inserted;
      }
    }),

  // ─── Storefront Shipping Rates Calculation ───────────────────
  calculateShipping: publicProcedure
    .input(
      z.object({
        storeId: z.number(),
        country: z.string(), // Country code, e.g. "PK", "US", "CA"
        weight: z.number(),  // Weight in kg
        cartValue: z.number(), // Cart total in store currency
      })
    )
    .query(async ({ input }) => {
      const zonesList = await db.select().from(shippingZones)
        .where(eq(shippingZones.storeId, input.storeId));

      // Find matching zone for country
      let matchedZone = zonesList.find((zone) => {
        const list = Array.isArray(zone.countries) ? zone.countries : [];
        return list.some(c => c.toLowerCase() === input.country.toLowerCase());
      });

      // Fallback: If no matching zone, use the zone that contains "global", "all", or is empty
      if (!matchedZone) {
        matchedZone = zonesList.find((zone) => {
          const list = Array.isArray(zone.countries) ? zone.countries : [];
          return list.length === 0 || list.some(c => ["all", "global", "*"].includes(c.toLowerCase()));
        });
      }

      const availableRates: Array<{
        id: string | number;
        name: string;
        price: number;
        type: string;
        carrier?: string;
      }> = [];

      if (matchedZone) {
        const ratesList = await db.select().from(shippingRates)
          .where(eq(shippingRates.zoneId, matchedZone.id));

        for (const rate of ratesList) {
          const priceVal = parseFloat(rate.price);
          const minVal = rate.minLimit ? parseFloat(rate.minLimit) : null;
          const maxVal = rate.maxLimit ? parseFloat(rate.maxLimit) : null;

          if (rate.type === "flat") {
            availableRates.push({
              id: rate.id,
              name: rate.name,
              price: priceVal,
              type: "flat",
            });
          } else if (rate.type === "weight_based") {
            const minMatches = minVal === null || input.weight >= minVal;
            const maxMatches = maxVal === null || input.weight <= maxVal;
            if (minMatches && maxMatches) {
              availableRates.push({
                id: rate.id,
                name: `${rate.name} (${input.weight}kg)`,
                price: priceVal,
                type: "weight_based",
              });
            }
          } else if (rate.type === "price_based") {
            const minMatches = minVal === null || input.cartValue >= minVal;
            const maxMatches = maxVal === null || input.cartValue <= maxVal;
            if (minMatches && maxMatches) {
              availableRates.push({
                id: rate.id,
                name: rate.name,
                price: priceVal,
                type: "price_based",
              });
            }
          }
        }
      }

      // Check third-party carrier integrations
      const carriers = await db.select().from(shippingCarrierSettings)
        .where(
          and(
            eq(shippingCarrierSettings.storeId, input.storeId),
            eq(shippingCarrierSettings.isEnabled, true)
          )
        );

      for (const carrier of carriers) {
        // Integrate third-party API mock calculations. In production, we'd invoke Easypost / Shipstation etc.
        // We'll mock carrier calculation beautifully based on carrier.
        if (carrier.carrier === "easypost") {
          availableRates.push({
            id: `carrier-easypost-standard`,
            name: "EasyPost Standard (Carrier)",
            price: matchedZone?.name === "International" ? 15.00 : 5.99,
            type: "carrier",
            carrier: "easypost",
          });
          availableRates.push({
            id: `carrier-easypost-express`,
            name: "EasyPost Express (Carrier)",
            price: matchedZone?.name === "International" ? 35.00 : 12.99,
            type: "carrier",
            carrier: "easypost",
          });
        } else if (carrier.carrier === "shipstation") {
          availableRates.push({
            id: `carrier-shipstation-priority`,
            name: "ShipStation Priority (Carrier)",
            price: 8.50,
            type: "carrier",
            carrier: "shipstation",
          });
        } else if (carrier.carrier === "leopard" || carrier.carrier === "tcs") {
          // Domestic shipping standard rates for Pakistan
          const basePrice = carrier.carrier === "tcs" ? 250 : 200;
          const weightSurcharge = Math.max(0, Math.ceil(input.weight - 1)) * 100; // Rs 100 per extra kg
          availableRates.push({
            id: `carrier-${carrier.carrier}-overnight`,
            name: `${carrier.carrier.toUpperCase()} Overnight Courier (Carrier)`,
            price: basePrice + weightSurcharge,
            type: "carrier",
            carrier: carrier.carrier,
          });
        }
      }

      // If absolutely no shipping rates are found, provide a smart default flat-rate shipping option
      if (availableRates.length === 0) {
        availableRates.push({
          id: "default-flat-rate",
          name: "Standard Shipping (Default)",
          price: 150, // Rs 150 or $1.50
          type: "flat",
        });
      }

      return availableRates;
    }),
});
