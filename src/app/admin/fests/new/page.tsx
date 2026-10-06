import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CreateFestForm } from './CreateFestForm';

export default async function NewFestPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
    redirect('/?denied=admin');
  }

  const organizations = await prisma.organization.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <CreateFestForm organizations={organizations} />
    </div>
  );
}
