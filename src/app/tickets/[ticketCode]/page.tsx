import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { TicketPass } from '@/components/TicketPass';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface TicketPageProps {
  params: Promise<{ ticketCode: string }>;
  searchParams: Promise<{ new?: string }>;
}

export default async function TicketPage({ params, searchParams }: TicketPageProps) {
  const { ticketCode } = await params;
  const { new: isNew } = await searchParams;

  const registration = await prisma.registration.findUnique({
    where: { ticketCode },
    include: {
      user: true,
      team: true,
      event: {
        include: {
          fest: true,
        },
      },
    },
  });

  if (!registration) {
    notFound();
  }

  return (
    <div className="w-full space-y-6">
      <div className="no-print">
        <Link
          href="/my-registrations"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to My Registrations
        </Link>
      </div>

      <TicketPass
        registration={registration}
        triggerConfetti={isNew === 'true'}
      />
    </div>
  );
}
