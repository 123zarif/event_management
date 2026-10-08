import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Suspense } from 'react';
import { AppNavigation } from '@/components/AppNavigation';
import { AccessDeniedToast } from '@/components/AccessDeniedToast';
import { RequireProfileDetails } from '@/components/RequireProfileDetails';
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

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#090d16' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://zarifzuhayer.tech'
  ),
  title: {
    default: 'ClubSphere — DRMC Smart Club Operations Platform',
    template: '%s | ClubSphere',
  },
  description:
    'Smart Club Operations & Event Management Platform for the 9th DRMC International Tech Carnival 2026. Real-time registrations, QR ticketing, live judging, and analytics.',
  applicationName: 'ClubSphere',
  authors: [{ name: 'DRMC Information Technology Club' }],
  generator: 'Next.js',
  keywords: [
    'DRMC',
    'Tech Carnival 2026',
    'Event Management Platform',
    'Competitive Programming',
    'Robotics Maze',
    'Esports Tournament',
    'ClubSphere',
    'Collegiate Fest',
    'QR Check-in',
    'Live Judging System',
    'Certificates Verification',
  ],
  referrer: 'origin-when-cross-origin',
  creator: 'DRMC Information Technology Club',
  publisher: 'Dhaka Residential Model College',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'ClubSphere',
    title: 'ClubSphere — DRMC Smart Club Operations Platform',
    description:
      'Smart Club Operations & Event Management Platform for the 9th DRMC International Tech Carnival 2026. Real-time registrations, QR ticketing, live judging, and analytics.',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'ClubSphere — Smart Club Operations Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClubSphere — DRMC Smart Club Operations Platform',
    description:
      'Smart Club Operations & Event Management Platform for the 9th DRMC International Tech Carnival 2026.',
    images: ['/api/og'],
    creator: '@drmcitclub',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
      <body className="h-full overflow-hidden flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-violet-600 selection:text-white transition-colors duration-150">
        <AppNavigation currentUser={currentUser}>
          {children}
        </AppNavigation>
        <RequireProfileDetails currentUser={currentUser} />
        <Suspense fallback={null}>
          <AccessDeniedToast />
        </Suspense>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
