import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    const { submissionId } = await params;
    const user = await getCurrentUser();

    if (!user || (user.role !== 'JUDGE' && user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized: Judge credentials required' }, { status: 403 });
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        team: true,
        user: true,
        event: true,
        scores: user ? { where: { judgeId: user.id } } : false,
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const myScore = submission.scores && submission.scores.length > 0 ? submission.scores[0] : null;

    let isAssigned = false;
    if (user.role === 'JUDGE') {
      const assignment = await prisma.eventJudge.findUnique({
        where: {
          eventId_judgeId: {
            eventId: submission.eventId,
            judgeId: user.id,
          },
        },
      });
      isAssigned = !!assignment;
    }

    return NextResponse.json({
      ...submission,
      myScore,
      isAssigned,
    });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
