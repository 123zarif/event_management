import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventSlug: string }> }
) {
  try {
    const { eventSlug } = await params;
    const [event, user] = await Promise.all([
      prisma.event.findUnique({
        where: { slug: eventSlug },
        include: {
          fest: true,
          _count: { select: { registrations: true } },
        },
      }),
      getCurrentUser(),
    ]);

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    let existingSubmission = null;
    if (user) {
      existingSubmission = await prisma.submission.findFirst({
        where: {
          eventId: event.id,
          userId: user.id,
        },
        include: {
          scores: {
            include: {
              judge: { select: { id: true, name: true } },
            },
          },
        },
      });
    }

    return NextResponse.json({ ...event, existingSubmission });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}
