import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ tickets: [], events: [] });
    }

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: user.id },
      include: {
        event: { select: { title: true } },
        messages: {
          select: { id: true, message: true, createdAt: true },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const events = await prisma.event.findMany({
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
    });

    return NextResponse.json({ tickets, events });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
