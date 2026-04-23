import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { invokeLLM } from "../_core/llm";

export const aiRouter = router({
  // Send a message to the AI agent
  chat: protectedProcedure
    .input(
      z.object({
        storeId: z.number(),
        type: z.enum(["design", "product_description", "banner", "content", "layout", "general"]),
        prompt: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify store ownership
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }

      // Create interaction record
      const interaction = await db.createAIInteraction({
        storeId: input.storeId,
        merchantId: ctx.user.id,
        type: input.type,
        prompt: input.prompt,
        status: "pending",
      });

      try {
        // Build context for the AI based on type
        let systemPrompt = `You are the Sellora AI assistant — an intelligent e-commerce advisor. Help merchants grow their business with actionable advice.`;

        if (input.type === "design") {
          systemPrompt = "You are an expert UI/UX designer for e-commerce stores. Help merchants create beautiful, modern store designs. Provide specific color recommendations, layout suggestions, and design principles.";
        } else if (input.type === "product_description") {
          systemPrompt = "You are an expert copywriter for e-commerce. Help merchants write compelling, SEO-optimized product descriptions that convert. Be concise but persuasive.";
        } else if (input.type === "banner") {
          systemPrompt = "You are a creative marketing expert. Help merchants create engaging banner copy and promotional content that drives sales.";
        } else if (input.type === "content") {
          systemPrompt = "You are a content strategist for e-commerce. Help merchants create engaging store content, blog posts, and marketing copy.";
        } else if (input.type === "layout") {
          systemPrompt = "You are an expert in e-commerce store layouts and user experience. Provide specific recommendations for store structure, navigation, and product organization.";
        }

        // Call LLM via our provider-agnostic service
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: input.prompt },
          ],
        });

        // Our LLM service returns a clean LLMResponse with .content
        const responseText = response.content || "";

        // Update interaction with response
        const interactionId = (interaction as any)?.rows?.[0]?.id ?? (interaction as any)?.insertId;
        if (interactionId) {
          await db.updateAIInteraction(interactionId, {
            response: responseText,
            status: "completed",
          });
        }

        return {
          success: true,
          response: responseText,
          model: response.model,
          provider: response.provider,
        };
      } catch (error) {
        console.error("[AI] Chat error:", error);
        throw error;
      }
    }),

  // Get chat history for a store
  getHistory: protectedProcedure
    .input(z.object({ storeId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Verify store ownership
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }

      return db.getAIInteractionsByStoreId(input.storeId);
    }),
});
