import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { RegisterForm } from './RegisterForm';

export const dynamic = 'force-dynamic';

interface RegisterPageProps {
  searchParams: Promise<{
    callbackUrl?: string;
    redirect?: string;
  }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const user = await getCurrentUser();
  const resolvedParams = await searchParams;
  const target = resolvedParams.callbackUrl || resolvedParams.redirect;

  // If user is already authenticated, redirect them immediately away from /register
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

  return <RegisterForm callbackUrl={target} />;
}
