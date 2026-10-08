import { cookies } from 'next/headers';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  institution?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
}

const PERSONA_COOKIE = 'clubsphere_session_email';

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const email = cookieStore.get(PERSONA_COOKIE)?.value;
    if (!email) return null;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        institution: true,
        phone: true,
        avatarUrl: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}

export async function setSessionUser(email: string): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    cookieStore.set(PERSONA_COOKIE, email, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days persistent session
    });
    return true;
  } catch {
    return false;
  }
}

export async function clearSessionUser(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(PERSONA_COOKIE);
  } catch {
    // ignore
  }
}

export async function verifyUserCredentials(email: string, passwordPlain: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) return null;

  const isValid = await bcrypt.compare(passwordPlain, user.passwordHash);
  if (!isValid) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    institution: user.institution,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
  };
}
