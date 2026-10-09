import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Register Account',
  description: 'Create an attendee or student account for the 9th DRMC International Tech Carnival 2026 on ClubSphere.',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}

