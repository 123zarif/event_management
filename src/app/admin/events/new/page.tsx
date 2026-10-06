import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CreateEventForm } from './CreateEventForm';

interface NewEventPageProps {
  searchParams: Promise<{ festId?: string }>;
}

export default async function NewEventPage({ searchParams }: NewEventPageProps) {
  const { festId } = await searchParams;
  const user = await getCurrentUser();

  if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
    redirect('/?denied=admin');
  }

  const [fests, categories] = await Promise.all([
    prisma.fest.findMany({
      orderBy: { startDate: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
      },
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        description: true,
      },
    }),
  ]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <CreateEventForm 
        fests={fests} 
        initialCategories={categories} 
        preselectedFestId={festId}
      />
    </div>
  );
}
