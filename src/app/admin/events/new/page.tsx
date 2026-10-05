import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CreateEventForm } from './CreateEventForm';

export default async function NewEventPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
    redirect('/?denied=admin');
  }

  const fests = await prisma.fest.findMany({
    orderBy: { startDate: 'asc' },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
    },
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <CreateEventForm fests={fests} />
    </div>
  );
}
