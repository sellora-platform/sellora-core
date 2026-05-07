'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const password = formData.get('password');
  const adminSecret = process.env.ADMIN_SECRET;

  if (password === adminSecret) {
    const cookieStore = await cookies();
    cookieStore.set('admin_session', adminSecret as string, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    redirect('/');
  } else {
    return { error: 'Invalid password' };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  redirect('/login');
}
