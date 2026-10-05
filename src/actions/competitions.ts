'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function submitProject(
  eventId: string,
  userId: string,
  data: {
    teamId?: string;
    title: string;
    repoUrl: string;
    liveDemoUrl: string;
    videoUrl?: string;
    description: string;
  }
) {
  try {
    const existing = await prisma.submission.findFirst({
      where: {
        eventId,
        OR: [{ userId }, ...(data.teamId ? [{ teamId: data.teamId }] : [])],
      },
    });

    let submission;
    if (existing) {
      submission = await prisma.submission.update({
        where: { id: existing.id },
        data: {
          title: data.title,
          repoUrl: data.repoUrl,
          liveDemoUrl: data.liveDemoUrl,
          videoUrl: data.videoUrl,
          description: data.description,
          submittedAt: new Date(),
        },
      });
    } else {
      submission = await prisma.submission.create({
        data: {
          eventId,
          userId,
          teamId: data.teamId,
          title: data.title,
          repoUrl: data.repoUrl,
          liveDemoUrl: data.liveDemoUrl,
          videoUrl: data.videoUrl,
          description: data.description,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        action: 'SUBMISSION_RECEIVED',
        entityType: 'Submission',
        entityId: submission.id,
        actorId: userId,
        metadata: { title: data.title, eventId },
      },
    });

    revalidatePath(`/events/${eventId}/submit`);
    revalidatePath(`/judge`);

    return { success: true, message: 'Project submitted successfully!', submission };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, message: err.message || 'Submission failed' };
  }
}

export async function submitJudgeScore(
  submissionId: string,
  judgeId: string,
  scores: {
    festDirectoryUX: number;
    registrationSystem: number;
    organizerManagement: number;
    bonusSolutions: number;
    feedback?: string;
  }
) {
  try {
    const totalScore =
      Number(scores.festDirectoryUX) +
      Number(scores.registrationSystem) +
      Number(scores.organizerManagement) +
      Number(scores.bonusSolutions);

    const judgeScore = await prisma.judgeScore.upsert({
      where: {
        submissionId_judgeId: {
          submissionId,
          judgeId,
        },
      },
      create: {
        submissionId,
        judgeId,
        criteriaBreakdown: {
          festDirectoryUX: scores.festDirectoryUX,
          registrationSystem: scores.registrationSystem,
          organizerManagement: scores.organizerManagement,
          bonusSolutions: scores.bonusSolutions,
        },
        totalScore,
        feedback: scores.feedback,
      },
      update: {
        criteriaBreakdown: {
          festDirectoryUX: scores.festDirectoryUX,
          registrationSystem: scores.registrationSystem,
          organizerManagement: scores.organizerManagement,
          bonusSolutions: scores.bonusSolutions,
        },
        totalScore,
        feedback: scores.feedback,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'SCORE_SUBMITTED',
        entityType: 'JudgeScore',
        entityId: judgeScore.id,
        actorId: judgeId,
        metadata: { totalScore, submissionId },
      },
    });

    revalidatePath('/judge');
    revalidatePath('/admin/competitions');

    return { success: true, message: `Score of ${totalScore}/120 submitted successfully!` };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, message: err.message || 'Scoring failed' };
  }
}

export async function toggleScoreboardFreeze(eventId: string, freeze: boolean) {
  try {
    const updated = await prisma.event.update({
      where: { id: eventId },
      data: { isScoreboardFrozen: freeze },
    });

    await prisma.auditLog.create({
      data: {
        action: freeze ? 'SCOREBOARD_FROZEN' : 'SCOREBOARD_UNFROZEN',
        entityType: 'Event',
        entityId: eventId,
        metadata: { eventTitle: updated.title },
      },
    });

    revalidatePath(`/events/${updated.slug}/leaderboard`);
    revalidatePath(`/admin/competitions/${updated.slug}/scoreboard`);

    return {
      success: true,
      message: freeze ? 'Scoreboard frozen for grand reveal!' : 'Scoreboard unfrozen and live.',
    };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, message: err.message || 'Toggle failed' };
  }
}

export async function advanceBracketWinner(matchId: string, winnerTeamId: string, score1: number, score2: number) {
  try {
    const match = await prisma.bracketMatch.findUnique({
      where: { id: matchId },
      include: { event: true },
    });

    if (!match) return { success: false, message: 'Match not found' };

    await prisma.bracketMatch.update({
      where: { id: matchId },
      data: {
        winnerId: winnerTeamId,
        score1,
        score2,
      },
    });

    // If next match exists, assign winner into next match
    if (match.nextMatchId) {
      const nextMatch = await prisma.bracketMatch.findUnique({ where: { id: match.nextMatchId } });
      if (nextMatch) {
        if (!nextMatch.team1Id) {
          await prisma.bracketMatch.update({ where: { id: nextMatch.id }, data: { team1Id: winnerTeamId } });
        } else if (!nextMatch.team2Id) {
          await prisma.bracketMatch.update({ where: { id: nextMatch.id }, data: { team2Id: winnerTeamId } });
        }
      }
    }

    revalidatePath(`/admin/competitions/${match.event.slug}/brackets`);
    revalidatePath(`/events/${match.event.slug}`);

    return { success: true, message: 'Match winner recorded and advanced!' };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, message: err.message || 'Failed to advance match' };
  }
}
