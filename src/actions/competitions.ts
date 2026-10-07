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
      // Check if deadline passed
      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (event?.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
        return { success: false, message: 'Submission deadline has passed. Revisions are closed.' };
      }

      submission = await prisma.submission.update({
        where: { id: existing.id },
        data: {
          title: data.title,
          repoUrl: data.repoUrl,
          liveDemoUrl: data.liveDemoUrl,
          videoUrl: data.videoUrl,
          description: data.description,
          revisionNumber: (existing.revisionNumber || 1) + 1,
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
          revisionNumber: 1,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        action: 'SUBMISSION_RECEIVED',
        entityType: 'Submission',
        entityId: submission.id,
        actorId: userId,
        metadata: { title: data.title, eventId, revisionNumber: submission.revisionNumber },
      },
    });

    revalidatePath(`/events/${eventId}/submit`);
    revalidatePath(`/judge`);

    return { 
      success: true, 
      message: `Project ${existing ? `Revision #${submission.revisionNumber}` : ''} submitted successfully! You may update it until the deadline.`, 
      submission 
    };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, message: err.message || 'Submission failed' };
  }
}

export async function claimSubmissionForReview(submissionId: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'JUDGE') {
      return { success: false, message: 'Unauthorized: Only certified Judges can claim submissions.' };
    }

    const sub = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        scores: true,
      },
    });

    if (!sub) return { success: false, message: 'Submission not found' };

    // Check assignment
    const isAssigned = await prisma.eventJudge.findUnique({
      where: {
        eventId_judgeId: {
          eventId: sub.eventId,
          judgeId: user.id,
        },
      },
    });

    if (!isAssigned) {
      return { success: false, message: 'You are not assigned to evaluate this competition track.' };
    }

    // Check if already scored by another judge
    if (sub.scores.length > 0 && sub.scores[0].judgeId !== user.id) {
      return { success: false, message: 'This project has already been evaluated by another judge.' };
    }

    // Check if claimed by another judge
    if (sub.claimedByJudgeId && sub.claimedByJudgeId !== user.id) {
      const claimJudge = await prisma.user.findUnique({
        where: { id: sub.claimedByJudgeId },
        select: { name: true },
      });
      return {
        success: false,
        message: `This project is already claimed for review by ${claimJudge?.name || 'another judge'}.`,
      };
    }

    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        claimedByJudgeId: user.id,
        claimedAt: new Date(),
      },
    });

    revalidatePath('/judge');
    revalidatePath(`/judge/eval/${submissionId}`);

    return { success: true, message: 'Project successfully claimed for your evaluation!' };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, message: err.message || 'Failed to claim project.' };
  }
}

export async function releaseSubmissionClaim(submissionId: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'JUDGE') {
      return { success: false, message: 'Unauthorized' };
    }

    const sub = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { scores: true },
    });

    if (!sub) return { success: false, message: 'Submission not found' };

    // Don't release if already scored
    if (sub.scores.some((s) => s.judgeId === user.id)) {
      return { success: false, message: 'Cannot release a submission that has already been scored.' };
    }

    if (sub.claimedByJudgeId !== user.id) {
      return { success: false, message: 'You do not hold the active claim on this submission.' };
    }

    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        claimedByJudgeId: null,
        claimedAt: null,
      },
    });

    revalidatePath('/judge');
    revalidatePath(`/judge/eval/${submissionId}`);

    return { success: true, message: 'Project claim released. Other judges can now review it.' };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, message: err.message || 'Failed to release claim.' };
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
      include: { 
        event: true,
        scores: true,
      },
    });

    if (!submission) {
      return { success: false, message: 'Submission not found.' };
    }

    // SINGLE-JUDGE EXCLUSIVITY & MANDATORY CLAIM ENFORCEMENT (Items #19 & #41)
    const existingOtherJudgeScore = submission.scores.find((s) => s.judgeId !== user.id);
    if (existingOtherJudgeScore) {
      return {
        success: false,
        message: 'Access Denied: This submission has already been evaluated by another certified judge. Only one judge may evaluate each submission.',
      };
    }

    // MANDATORY CLAIM (Item #41): Judge cannot evaluate unless they have explicitly claimed the submission
    if (!submission.claimedByJudgeId) {
      return {
        success: false,
        message: 'Access Denied: You must claim this project before evaluating it. Please click "Claim Project for Evaluation" first.',
      };
    }

    // EXCLUSIVE CLAIM (Item #19): Another judge cannot evaluate if claimed by someone else
    if (submission.claimedByJudgeId !== user.id) {
      const claimJudge = await prisma.user.findUnique({
        where: { id: submission.claimedByJudgeId },
        select: { name: true },
      });
      return {
        success: false,
        message: `Access Denied: This submission is currently claimed by ${claimJudge?.name || 'another judge'}. Only the claiming judge can evaluate this project.`,
      };
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

    // Ensure claimedByJudgeId is locked to this judge
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        claimedByJudgeId: user.id,
        claimedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'SCORE_SUBMITTED',
        entityType: 'JudgeScore',
        entityId: judgeScore.id,
        actorId: judgeId,
        metadata: { totalScore, submissionId, judgeName: user.name },
      },
    });

    revalidatePath('/judge');
    revalidatePath('/admin/competitions');
    revalidatePath(`/events/${submission.event.slug}/leaderboard`);

    return { success: true, message: `Score of ${totalScore} points recorded successfully by Judge ${user.name}!` };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, message: err.message || 'Scoring failed' };
  }
}

export async function toggleScoreboardFreeze(eventId: string, freeze: boolean) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    // Allow Organizer, Admin, or an assigned Judge to freeze / publish final standings
    const isOrgOrAdmin = user.role === 'ORGANIZER' || user.role === 'ADMIN';
    let isAssignedJudge = false;

    if (user.role === 'JUDGE') {
      const assignment = await prisma.eventJudge.findUnique({
        where: {
          eventId_judgeId: {
            eventId,
            judgeId: user.id,
          },
        },
      });
      isAssignedJudge = !!assignment;
    }

    if (!isOrgOrAdmin && !isAssignedJudge) {
      return { success: false, message: 'Unauthorized: Only Organizers or Assigned Judges can freeze / publish the scoreboard.' };
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
        actorId: user.id,
        metadata: { eventTitle: updated.title, toggledBy: user.name, role: user.role },
      },
    });

    revalidatePath(`/events/${updated.slug}/leaderboard`);
    revalidatePath(`/admin/competitions/${updated.slug}/scoreboard`);

    return {
      success: true,
      message: freeze ? 'Scoreboard frozen for grand reveal!' : 'Scoreboard unfrozen and official standings published!',
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
