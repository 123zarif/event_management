import React from 'react';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { CategoryManagerClient } from './CategoryManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
    redirect('/?denied=admin');
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { events: true },
      },
    },
  });

  const serialized = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    color: c.color,
    eventCount: c._count.events,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <CategoryManagerClient initialCategories={serialized} />
    </div>
  );
}
