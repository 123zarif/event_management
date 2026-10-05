import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function JudgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'JUDGE' && user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
    redirect('/?denied=judge');
  }

  return <>{children}</>;
}
