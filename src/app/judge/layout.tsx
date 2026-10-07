import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

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
