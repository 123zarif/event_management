import React from 'react';
import EventDetailPage from '@/app/events/[eventSlug]/page';

export const dynamic = 'force-dynamic';

interface FestEventPageProps {
  params: Promise<{ festSlug: string; eventSlug: string }>;
}

export default async function FestEventDetailPage({ params }: FestEventPageProps) {
  const resolvedParams = await params;
  return <EventDetailPage params={Promise.resolve({ eventSlug: resolvedParams.eventSlug })} />;
}

