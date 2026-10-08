import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to access your ClubSphere participant, judge, or organizer workstation.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}

