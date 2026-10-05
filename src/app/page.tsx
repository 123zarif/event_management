import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { AttendeeDashboard } from '@/components/dashboards/AttendeeDashboard';
import { JudgeDashboard } from '@/components/dashboards/JudgeDashboard';
import { OrganizerDashboard } from '@/components/dashboards/OrganizerDashboard';
import { PublicFestShowcase } from '@/components/dashboards/PublicFestShowcase';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const currentUser = await getCurrentUser();

  if (currentUser?.role === 'ORGANIZER' || currentUser?.role === 'ADMIN') {
    return <OrganizerDashboard currentUser={currentUser} />;
  }

  if (currentUser?.role === 'JUDGE') {
    return <JudgeDashboard currentUser={currentUser} />;
  }

  if (currentUser?.role === 'ATTENDEE') {
    return <AttendeeDashboard currentUser={currentUser} />;
  }

  return <PublicFestShowcase />;
}
