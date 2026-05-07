'use server';

import { db } from '@/lib/db';
import { subscriptionRequests, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function processSubscriptionRequest(
  requestId: number, 
  merchantId: number, 
  tier: any, 
  status: 'approved' | 'rejected',
  adminNotes?: string
) {
  try {
    // 1. Update the request status
    await db.update(subscriptionRequests)
      .set({ 
        status: status,
        adminNotes: adminNotes,
        updatedAt: new Date()
      })
      .where(eq(subscriptionRequests.id, requestId));

    // 2. If approved, update the merchant's tier
    if (status === 'approved') {
      await db.update(users)
        .set({ 
          tier: tier,
          subscriptionStatus: 'active'
        })
        .where(eq(users.id, merchantId));
    }

    revalidatePath('/subscriptions');
    revalidatePath('/merchants');
    revalidatePath('/');
    
    return { success: true };
  } catch (error) {
    console.error('Error processing request:', error);
    return { success: false, error: 'Failed to process request' };
  }
}
