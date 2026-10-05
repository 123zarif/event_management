'use server';

import { setSessionUser, clearSessionUser, verifyUserCredentials } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function switchPersonaAction(email: string, redirectTo?: string) {
  await setSessionUser(email);
  revalidatePath('/', 'layout');
  if (redirectTo) {
    redirect(redirectTo);
  }
  return { success: true };
}

export async function loginAction(formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, message: 'Please provide both email and password' };
  }

  const user = await verifyUserCredentials(email, password);
  if (!user) {
    return { success: false, message: 'Invalid email or password' };
  }

  await setSessionUser(user.email);
  revalidatePath('/', 'layout');

  if (user.role === 'ORGANIZER' || user.role === 'ADMIN') {
    redirect('/admin');
  } else if (user.role === 'JUDGE') {
    redirect('/judge');
  } else {
    redirect('/events');
  }
}

export async function signupAction(formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;
  const institution = (formData.get('institution') as string)?.trim();
  const phone = (formData.get('phone') as string)?.trim();

  if (!name || !email || !password) {
    return { success: false, message: 'Please provide full name, email, and password' };
  }

  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters long' };
  }

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    return { success: false, message: 'An account with this email already exists. Please log in.' };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      institution: institution || null,
      phone: phone || null,
      role: Role.ATTENDEE,
    },
  });

  await setSessionUser(newUser.email);
  revalidatePath('/', 'layout');
  redirect('/events');
}

export async function logoutAction() {
  await clearSessionUser();
  revalidatePath('/', 'layout');
  redirect('/');
}
