'use server';

import { setSessionUser, clearSessionUser, verifyUserCredentials, getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';



export async function loginAction(formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;
  const callbackUrl = (formData.get('callbackUrl') as string)?.trim();

  if (!email || !password) {
    return { success: false, message: 'Please provide both email and password' };
  }

  const user = await verifyUserCredentials(email, password);
  if (!user) {
    return { success: false, message: 'Invalid email or password' };
  }

  await setSessionUser(user.email);
  revalidatePath('/', 'layout');

  if (callbackUrl && callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')) {
    redirect(callbackUrl);
  }

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
  const callbackUrl = (formData.get('callbackUrl') as string)?.trim();

  if (!name || !email || !password || !institution || !phone) {
    return { success: false, message: 'Please provide full name, email, password, institution, and phone number' };
  }

  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters long' };
  }

  if (phone.length < 6) {
    return { success: false, message: 'Please provide a valid contact phone number' };
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
      institution,
      phone,
      role: Role.ATTENDEE,
    },
  });

  await setSessionUser(newUser.email);
  revalidatePath('/', 'layout');

  if (callbackUrl && callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')) {
    redirect(callbackUrl);
  } else {
    redirect('/events');
  }
}

export async function updateProfileDetailsAction(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { success: false, message: 'Unauthorized: Please sign in to update your profile' };
  }

  const institution = (formData.get('institution') as string)?.trim();
  const phone = (formData.get('phone') as string)?.trim();

  if (!institution || !phone) {
    return { success: false, message: 'Both educational institution and phone number are required' };
  }

  if (phone.length < 6) {
    return { success: false, message: 'Please provide a valid contact phone number' };
  }

  try {
    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        institution,
        phone,
      },
    });

    revalidatePath('/', 'layout');
    return { success: true, message: 'Profile updated successfully' };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, message: 'Failed to update profile details' };
  }
}

export async function logoutAction() {
  await clearSessionUser();
  revalidatePath('/', 'layout');
  redirect('/');
}
