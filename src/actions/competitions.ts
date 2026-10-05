'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
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
    festDirectoryUX?: number;
    registrationSystem?: number;
    organizerManagement?: number;
    bonusSolutions?: number;
    dynamicCriteria?: Record<string, number>;
    feedback?: string;
  }
) {
  try {
    const user = await getCurrentUser();
    // FAIR-PLAY ENFORCEMENT: Strictly prohibit Organizers and Admins from judging submitted projects
    if (!user || user.role !== 'JUDGE') {
      return { 
        success: false, 
        message: 'Access Denied: Only certified Judges can evaluate and submit scores. Organizers and Admins are prohibited from judging to preserve competition integrity.' 
      };
    }

    // COMPETITION ROSTER ENFORCEMENT: Judge must be specifically assigned to this competition track
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { event: true },
    });

    if (!submission) {
      return { success: false, message: 'Submission not found.' };
    }

    const isAssigned = await prisma.eventJudge.findUnique({
      where: {
        eventId_judgeId: {
          eventId: submission.eventId,
          judgeId: user.id,
        },
      },
    });

    if (!isAssigned) {
      return {
        success: false,
        message: `Access Denied: You are not assigned to evaluate "${submission.event.title}". Only official judges specifically assigned to this competition can evaluate and score submissions.`,
      };
    }

    let criteriaBreakdown: Record<string, number> = {};
    let totalScore = 0;

    if (scores.dynamicCriteria && Object.keys(scores.dynamicCriteria).length > 0) {
      criteriaBreakdown = { ...scores.dynamicCriteria };
      totalScore = Object.values(scores.dynamicCriteria).reduce((acc, val) => acc + Number(val || 0), 0);
    } else {
      criteriaBreakdown = {
        festDirectoryUX: Number(scores.festDirectoryUX || 0),
        registrationSystem: Number(scores.registrationSystem || 0),
        organizerManagement: Number(scores.organizerManagement || 0),
        bonusSolutions: Number(scores.bonusSolutions || 0),
      };
      totalScore =
        criteriaBreakdown.festDirectoryUX +
        criteriaBreakdown.registrationSystem +
        criteriaBreakdown.organizerManagement +
        criteriaBreakdown.bonusSolutions;
    }

    const judgeScore = await prisma.judgeScore.upsert({
      where: {
        submissionId_judgeId: {
          submissionId,
          judgeId: user.id,
        },
      },
      create: {
        submissionId,
        judgeId: user.id,
        criteriaBreakdown,
        totalScore,
        feedback: scores.feedback,
      },
      update: {
        criteriaBreakdown,
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
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
      return { success: false, message: 'Unauthorized: Organizer privileges required' };
    }

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
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
      return { success: false, message: 'Unauthorized: Organizer privileges required' };
    }

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
