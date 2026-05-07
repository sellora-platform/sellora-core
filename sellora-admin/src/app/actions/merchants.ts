'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function updateMerchantTier(userId: number, newTier: any) {
  try {
    await db.update(users)
      .set({ tier: newTier })
      .where(eq(users.id, userId));
    
    revalidatePath('/merchants');
    return { success: true };
  } catch (error) {
    console.error('Error updating tier:', error);
    return { success: false, error: 'Failed to update plan' };
  }
}
