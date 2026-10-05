import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventSlug: string }> }
) {
  try {
    const { eventSlug } = await params;
    const event = await prisma.event.findUnique({
      where: { slug: eventSlug },
      include: {
        fest: true,
        _count: { select: { registrations: true } },
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}
