'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { Role } from '@prisma/client';

export async function assignJudgeToEvent(eventId: string, judgeId: string) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
      return {
        success: false,
        message: 'Unauthorized: Only Organizers and Admins can assign judges to competitions.',
      };
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return { success: false, message: 'Event not found.' };
    }

    const judge = await prisma.user.findUnique({
      where: { id: judgeId },
    });

    if (!judge || judge.role !== Role.JUDGE) {
      return { success: false, message: 'Selected user is not certified as a Contest Judge.' };
    }

    const assignment = await prisma.eventJudge.upsert({
      where: {
        eventId_judgeId: {
          eventId,
          judgeId,
        },
      },
      update: {},
      create: {
        eventId,
        judgeId,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'JUDGE_ASSIGNED',
        entityType: 'EventJudge',
        entityId: assignment.id,
        actorId: user.id,
        metadata: {
          eventTitle: event.title,
          judgeName: judge.name,
          judgeEmail: judge.email,
        },
      },
    });

    revalidatePath(`/admin/competitions/${event.slug}/judges`);
    revalidatePath('/judge');
    revalidatePath(`/events/${event.slug}`);

    return {
      success: true,
      message: `Judge ${judge.name} assigned to "${event.title}"!`,
    };
  } catch (error: unknown) {
    const err = error as Error;
    return {
      success: false,
      message: err.message || 'Failed to assign judge.',
    };
  }
}

export async function removeJudgeFromEvent(eventId: string, judgeId: string) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
      return {
        success: false,
        message: 'Unauthorized: Only Organizers and Admins can remove judges from competitions.',
      };
    }

    const assignment = await prisma.eventJudge.findUnique({
      where: {
        eventId_judgeId: {
          eventId,
          judgeId,
        },
      },
      include: {
        event: true,
        judge: true,
      },
    });

    if (!assignment) {
      return { success: false, message: 'Judge is not assigned to this competition.' };
    }

    await prisma.eventJudge.delete({
      where: {
        eventId_judgeId: {
          eventId,
          judgeId,
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'JUDGE_REMOVED',
        entityType: 'EventJudge',
        entityId: assignment.id,
        actorId: user.id,
        metadata: {
          eventTitle: assignment.event.title,
          judgeName: assignment.judge.name,
        },
      },
    });

    revalidatePath(`/admin/competitions/${assignment.event.slug}/judges`);
    revalidatePath('/judge');
    revalidatePath(`/events/${assignment.event.slug}`);

    return {
      success: true,
      message: `Judge ${assignment.judge.name} removed from "${assignment.event.title}".`,
    };
  } catch (error: unknown) {
    const err = error as Error;
    return {
      success: false,
      message: err.message || 'Failed to remove judge.',
    };
  }
}

export async function getEventJudges(eventId: string) {
  const [assigned, allJudges] = await Promise.all([
    prisma.eventJudge.findMany({
      where: { eventId },
      include: {
        judge: {
          select: {
            id: true,
            name: true,
            email: true,
            institution: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { assignedAt: 'asc' },
    }),
    prisma.user.findMany({
      where: { role: Role.JUDGE },
      select: {
        id: true,
        name: true,
        email: true,
        institution: true,
        avatarUrl: true,
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  const assignedJudgeIds = new Set(assigned.map((a) => a.judge.id));
  const availableJudges = allJudges.filter((j) => !assignedJudgeIds.has(j.id));

  return {
    assigned: assigned.map((a) => ({
      assignmentId: a.id,
      assignedAt: a.assignedAt.toISOString(),
      judge: a.judge,
    })),
    available: availableJudges,
  };
}

export async function isJudgeAssignedToEvent(eventId: string, judgeId: string) {
  const assignment = await prisma.eventJudge.findUnique({
    where: {
      eventId_judgeId: {
        eventId,
        judgeId,
      },
    },
  });
  return !!assignment;
}
