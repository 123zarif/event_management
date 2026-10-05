import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const eventId = searchParams.get('eventId');

    const where: Record<string, unknown> = {};
    if (status && status !== 'ALL') where.status = status;
    if (eventId && eventId !== 'ALL') where.eventId = eventId;

    const registrations = await prisma.registration.findMany({
      where,
      include: {
        user: true,
        event: true,
        team: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Generate CSV string
    const headers = ['Ticket Code', 'Attendee Name', 'Email', 'Institution', 'Phone', 'Event', 'Team', 'Status', 'Registered At', 'Checked In At'];
    const rows = registrations.map((r) => [
      `"${r.ticketCode}"`,
      `"${r.user.name.replace(/"/g, '""')}"`,
      `"${r.user.email}"`,
      `"${(r.user.institution || '').replace(/"/g, '""')}"`,
      `"${r.user.phone || ''}"`,
      `"${r.event.title.replace(/"/g, '""')}"`,
      `"${(r.team?.name || '').replace(/"/g, '""')}"`,
      `"${r.status}"`,
      `"${r.createdAt.toISOString()}"`,
      `"${r.checkedInAt ? r.checkedInAt.toISOString() : ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="drmc-participants-${Date.now()}.csv"`,
      },
    });
  } catch {
    return new NextResponse('Export failed', { status: 500 });
  }
}
