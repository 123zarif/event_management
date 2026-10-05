import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppNavigation } from '@/components/AppNavigation';
import { getCurrentUser } from '@/lib/auth';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ClubSphere — DRMC Smart Club Operations Platform',
  description:
    'Smart Club Operations & Event Management Platform for the 9th DRMC International Tech Carnival 2026. Eliminating Google Forms with dynamic registrations, QR ticketing, and competition operations.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                if (theme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-violet-600 selection:text-white transition-colors duration-150">
        <AppNavigation currentUser={currentUser}>
          {children}
        </AppNavigation>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
