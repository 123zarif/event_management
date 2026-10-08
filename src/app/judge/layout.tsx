import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Judge Evaluation Station',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function JudgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'JUDGE') {
    redirect('/?denied=judge');
  }

  return <>{children}</>;
}
