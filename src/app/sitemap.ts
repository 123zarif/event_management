import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://zarifzuhayer.tech';

  try {
    const events = await prisma.event.findMany({
      select: { slug: true, updatedAt: true },
    });

    const fests = await prisma.fest.findMany({
      select: { slug: true, updatedAt: true },
    });

    const staticRoutes: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/events`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/fests`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/leaderboards`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/verify-certificate`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
    ];

    const eventRoutes: MetadataRoute.Sitemap = events.map((e) => ({
      url: `${baseUrl}/events/${e.slug}`,
      lastModified: e.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    const festRoutes: MetadataRoute.Sitemap = fests.map((f) => ({
      url: `${baseUrl}/fests/${f.slug}`,
      lastModified: f.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticRoutes, ...eventRoutes, ...festRoutes];
  } catch {
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
    ];
  }
}

