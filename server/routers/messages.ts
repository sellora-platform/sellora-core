import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { conversations, messages, communicationChannels, stores } from "../../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { sendEmail } from "../_core/email";

export const messagesRouter = router({
  // PUBLIC — Submit contact form from website
  submitContactForm: publicProcedure
    .input(z.object({
      storeId: z.number(),
      name: z.string().min(1),
      email: z.string().email(),
      subject: z.string().optional(),
      message: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const { storeId, name, email, subject, message } = input;

      // 1. Get store details to find merchant email
      const store = await db.query.stores.findFirst({
        where: eq(stores.id, storeId),
      });

      if (!store) throw new Error("Store not found");

      // 2. Find or create conversation
      let conversation = await db.query.conversations.findFirst({
        where: and(
          eq(conversations.storeId, storeId),
          eq(conversations.customerIdentifier, email)
        ),
      });

      if (!conversation) {
        const newConv = await db.insert(conversations).values({
          storeId,
          customerName: name,
          customerIdentifier: email,
          lastMessage: message,
          lastActivity: new Date(),
        }).returning();
        conversation = newConv[0];
      } else {
        // Update existing conversation
        await db.update(conversations)
          .set({ 
            lastMessage: message, 
            lastActivity: new Date(),
            unreadCount: (conversation.unreadCount || 0) + 1 
          })
          .where(eq(conversations.id, conversation.id));
      }

      // 3. Insert the message
      await db.insert(messages).values({
        conversationId: conversation.id,
        senderType: 'customer',
        senderId: email,
        body: message,
        status: 'sent',
        metadata: { subject, name }
      });

      // 4. Send Email Notification to Merchant
      const merchantEmail = store.email || "support@sellora.com"; 
      await sendEmail({
        to: merchantEmail,
        subject: `New Contact Message from ${name} - ${store.name}`,
        html: `
          <h3>New Message Received</h3>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject || 'No Subject'}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          <hr/>
          <p>Reply directly from your <a href="https://dashboard.raaenai.com/connect">Sellora Connect Dashboard</a></p>
        `
      });

      return { success: true };
    }),

  // PROTECTED — Connect a new communication channel
  connectChannel: protectedProcedure
    .input(z.object({
      storeId: z.number(),
      type: z.enum(["whatsapp", "instagram", "facebook", "email", "sms"]),
      settings: z.any()
    }))
    .mutation(async ({ input }) => {
      const { storeId, type, settings } = input;

      // Update if exists, otherwise insert
      const existing = await db.query.communicationChannels.findFirst({
        where: and(
          eq(communicationChannels.storeId, storeId),
          eq(communicationChannels.type, type)
        )
      });

      if (existing) {
        await db.update(communicationChannels)
          .set({ settings, updatedAt: new Date() })
          .where(eq(communicationChannels.id, existing.id));
      } else {
        await db.insert(communicationChannels).values({
          storeId,
          type,
          settings,
          status: 'active'
        });
      }

      return { success: true };
    }),

  // PROTECTED — List all connected channels for a store
  listChannels: protectedProcedure
    .input(z.object({ storeId: z.number() }))
    .query(async ({ input }) => {
      return await db.query.communicationChannels.findMany({
        where: eq(communicationChannels.storeId, input.storeId)
      });
    }),

  // PROTECTED — List conversations for merchant
  listConversations: protectedProcedure
    .input(z.object({ storeId: z.number() }))
    .query(async ({ input }) => {
      return await db.query.conversations.findMany({
        where: eq(conversations.storeId, input.storeId),
        orderBy: [desc(conversations.lastActivity)],
      });
    }),

  // PROTECTED — List messages in a conversation
  listMessages: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input }) => {
      return await db.query.messages.findMany({
        where: eq(messages.conversationId, input.conversationId),
        orderBy: [messages.createdAt],
      });
    }),
});
