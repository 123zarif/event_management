'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';

export function AccessDeniedToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const deniedReason = searchParams.get('denied');
    if (deniedReason) {
      if (deniedReason === 'admin') {
        toast.error('Access Denied: Organizer/Staff privileges required.', {
          description: 'Your current role does not have permission to view the Organizer portal.',
        });
      } else if (deniedReason === 'judge') {
        toast.error('Access Denied: Contest Judge credentials required.', {
          description: 'Your current role does not have permission to access the Judge scoring portal.',
        });
      } else {
        toast.error('Access Denied: Insufficient role permissions.');
      }

      // Clean up URL without triggering re-render loop
      const params = new URLSearchParams(searchParams.toString());
      params.delete('denied');
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, router, pathname]);

  return null;
}
