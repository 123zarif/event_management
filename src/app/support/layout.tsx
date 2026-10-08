import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support & Help Desk',
  description: 'Submit inquiries, incident reports, and query event organizers directly.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return children;
}

