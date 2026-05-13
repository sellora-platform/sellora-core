import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { conversations, messages, communicationChannels, stores, users } from "../../db/schema";
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
      // Fetch the merchant (user) who owns this store to get their email
      const merchant = await db.query.users.findFirst({
        where: eq(users.id, store.merchantId),
      });

      const merchantEmail = merchant?.email || "support@sellora.com"; 
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
          <p>Reply directly from your <a href="https://dashboard.raaenai.com/inbox">Sellora Inbox</a></p>
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

  // PUBLIC — Get Google OAuth URL for merchant to login
  getGoogleAuthUrl: publicProcedure
    .input(z.object({ storeId: z.number() }))
    .query(async ({ input }) => {
      // In a real scenario, you'd use the 'googleapis' library here.
      // For now, I'm constructing the URL structure.
      const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
      const options = {
        redirect_uri: (process.env.NEXT_PUBLIC_API_URL || "https://www.raaenai.com").replace(/\/$/, '') + "/api/auth/google/callback",
        client_id: process.env.GOOGLE_CLIENT_ID || "PLACEHOLDER_CLIENT_ID",
        access_type: "offline",
        response_type: "code",
        prompt: "consent",
        scope: [
          "https://www.googleapis.com/auth/userinfo.profile",
          "https://www.googleapis.com/auth/userinfo.email",
          "https://www.googleapis.com/auth/gmail.send"
        ].join(" "),
        state: JSON.stringify({ storeId: input.storeId })
      };

      const qs = new URLSearchParams(options);
      return { url: `${rootUrl}?${qs.toString()}` };
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

  // PROTECTED — Send a reply message from merchant
  sendMessage: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      body: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const { conversationId, body } = input;

      // 1. Get conversation details
      const conversation = await db.query.conversations.findFirst({
        where: eq(conversations.id, conversationId),
        with: {
          channel: true
        }
      });

      if (!conversation) throw new Error("Conversation not found");

      // 2. Insert message into DB
      await db.insert(messages).values({
        conversationId,
        senderType: 'merchant',
        body,
        status: 'sent',
      });

      // 3. Update conversation
      await db.update(conversations)
        .set({ 
          lastMessage: body, 
          lastActivity: new Date(),
          unreadCount: 0 // Merchant has replied
        })
        .where(eq(conversations.id, conversationId));

      // 4. Actually send the external message
      if (conversation.channel?.type === 'email') {
        const settings = (conversation.channel.settings as any) || {};
        
        // Use Resend for merchant notifications, but we can also use their own SMTP/Gmail later
        // For now, we reply via our system email to the customer's email
        await sendEmail({
          to: conversation.customerIdentifier,
          subject: `Re: Message regarding your inquiry`,
          html: `
            <p>${body}</p>
            <br/>
            <p>— ${conversation.customerName || 'Store Team'}</p>
          `
        });
      }

      return { success: true };
    }),
});
