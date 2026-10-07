import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { eventDate: 'asc' },
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        customCategory: true,
        isCompetitive: true,
        venue: true,
        eventDate: true,
        capacity: true,
        _count: {
          select: { registrations: true },
        },
        fest: {
          select: {
            slug: true,
            title: true,
          },
        },
      },
    });

    const serialized = events.map((e) => ({
      id: e.id,
      slug: e.slug,
      title: e.title,
      category: e.customCategory || e.category,
      isCompetitive: e.isCompetitive,
      venue: e.venue,
      eventDate: e.eventDate ? e.eventDate.toISOString() : null,
      capacity: e.capacity,
      registeredCount: e._count.registrations,
      festSlug: e.fest.slug,
      festTitle: e.fest.title,
    }));

    return NextResponse.json(serialized);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
