import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { EditFestForm } from './EditFestForm';

export const dynamic = 'force-dynamic';

interface EditFestPageProps {
  params: Promise<{ festSlug: string }>;
}

export default async function EditFestPage({ params }: EditFestPageProps) {
  const { festSlug } = await params;
  const user = await getCurrentUser();

  if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
    redirect('/?denied=admin');
  }

  const [fest, organizations] = await Promise.all([
    prisma.fest.findUnique({
      where: { slug: festSlug },
    }),
    prisma.organization.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }),
  ]);

  if (!fest) {
    notFound();
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <EditFestForm
        fest={{
          id: fest.id,
          title: fest.title,
          slug: fest.slug,
          description: fest.description,
          location: fest.location,
          startDate: fest.startDate.toISOString(),
          endDate: fest.endDate.toISOString(),
          status: fest.status,
          bannerUrl: fest.bannerUrl,
          organizationId: fest.organizationId,
        }}
        organizations={organizations}
      />
    </div>
  );
}

