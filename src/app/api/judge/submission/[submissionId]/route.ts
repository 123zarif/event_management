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

    if (!user || user.role !== 'JUDGE') {
      return NextResponse.json(
        { error: 'Unauthorized: Only certified Judges can access project evaluation data.' },
        { status: 403 }
      );
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        team: true,
        user: true,
        event: true,
        scores: {
          include: {
            judge: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    let claimedByJudge = null;
    if (submission.claimedByJudgeId) {
      claimedByJudge = await prisma.user.findUnique({
        where: { id: submission.claimedByJudgeId },
        select: { id: true, name: true, email: true },
      });
    }

    const myScore = submission.scores.find((s) => s.judgeId === user.id) || null;
    const existingOtherScore = submission.scores.find((s) => s.judgeId !== user.id) || null;

    const assignment = await prisma.eventJudge.findUnique({
      where: {
        eventId_judgeId: {
          eventId: submission.eventId,
          judgeId: user.id,
        },
      },
    });
    const isAssigned = !!assignment;

    return NextResponse.json({
      ...submission,
      claimedByJudge,
      myScore,
      existingOtherScore,
      isAssigned,
    });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
