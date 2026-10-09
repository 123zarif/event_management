import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';

interface LoginPageProps {
  searchParams: Promise<{
    callbackUrl?: string;
    redirect?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();
  const resolvedParams = await searchParams;
  const target = resolvedParams.callbackUrl || resolvedParams.redirect;

  // If user is already authenticated, redirect them immediately away from /login
  if (user) {
    if (target && target.startsWith('/') && !target.startsWith('//')) {
      redirect(target);
    }

    if (user.role === 'ORGANIZER' || user.role === 'ADMIN') {
      redirect('/admin');
    } else if (user.role === 'JUDGE') {
      redirect('/judge');
    } else {
      redirect('/');
    }
  }

  return <LoginForm callbackUrl={target} />;
}
