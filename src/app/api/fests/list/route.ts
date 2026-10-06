import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const fests = await prisma.fest.findMany({
      orderBy: { startDate: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        startDate: true,
        endDate: true,
        location: true,
        status: true,
        _count: {
          select: { events: true },
        },
        organization: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    const serialized = fests.map((f) => ({
      id: f.id,
      slug: f.slug,
      title: f.title,
      startDate: f.startDate.toISOString(),
      endDate: f.endDate.toISOString(),
      location: f.location,
      status: f.status,
      eventCount: f._count.events,
      organizationName: f.organization.name,
    }));

    return NextResponse.json(serialized);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
