import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { PrintBadgeSheet } from '@/components/PrintBadgeSheet';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface BadgesPageProps {
  params: Promise<{ eventSlug: string }>;
}

export default async function EventBadgesPrintPage({ params }: BadgesPageProps) {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
    redirect('/');
  }

  const { eventSlug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug: eventSlug },
    include: {
      fest: true,
      registrations: {
        where: {
          status: { in: ['CONFIRMED', 'CHECKED_IN'] },
        },
        include: {
          user: true,
          team: true,
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!event) {
    notFound();
  }

  const badges = event.registrations.map((r) => ({
    ticketCode: r.ticketCode,
    name: r.user.name,
    email: r.user.email,
    institution: r.user.institution,
    role: r.team ? 'Contestant (Team)' : 'Participant',
    eventTitle: event.title,
    festTitle: event.fest.title,
    teamName: r.team?.name,
  }));

  return (
    <div className="w-full space-y-6">
      <div className="no-print">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Admin Dashboard
        </Link>
      </div>

      <PrintBadgeSheet badges={badges} eventTitle={event.title} />
    </div>
  );
}
