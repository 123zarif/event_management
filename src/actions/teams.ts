'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { registerForEvent } from './registration';

export async function createTeam(eventId: string, captainId: string, teamName: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) return { success: false, message: 'Event not found' };
    if (!event.isTeamEvent) return { success: false, message: 'This is not a team event' };

    // Generate unique readable invite code
    const cleanName = teamName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() || 'TEAM';
    const randomCode = Math.floor(100 + Math.random() * 900);
    const inviteCode = `${cleanName}-${randomCode}`;

    const team = await prisma.team.create({
      data: {
        name: teamName,
        inviteCode,
        eventId,
        captainId,
      },
    });

    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId: captainId,
      },
    });

    // Register captain
    const regResult = await registerForEvent(eventId, captainId, { teamId: team.id });

    revalidatePath(`/events/${event.slug}`);
    revalidatePath('/my-registrations');

    return {
      success: true,
      message: `Team "${teamName}" created! Share code: ${inviteCode}`,
      team,
      inviteCode,
      ticketCode: regResult.ticketCode,
    };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, message: err.message || 'Failed to create team' };
  }
}

export async function joinTeam(inviteCode: string, userId: string) {
  try {
    const team = await prisma.team.findUnique({
      where: { inviteCode: inviteCode.trim().toUpperCase() },
      include: {
        event: true,
        members: true,
      },
    });

    if (!team) {
      return { success: false, message: 'Invalid team invite code' };
    }

    if (team.members.length >= team.event.maxTeamSize) {
      return { success: false, message: `Team is already full (Max ${team.event.maxTeamSize} members)` };
    }

    const alreadyMember = team.members.some((m) => m.userId === userId);
    if (alreadyMember) {
      return { success: false, message: 'You are already a member of this team' };
    }

    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId,
      },
    });

    // Register member under this team
    const regResult = await registerForEvent(team.eventId, userId, { teamId: team.id });

    revalidatePath(`/events/${team.event.slug}`);
    revalidatePath('/my-registrations');

    return {
      success: true,
      message: `Successfully joined team "${team.name}"!`,
      team,
      ticketCode: regResult.ticketCode,
    };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, message: err.message || 'Failed to join team' };
  }
}
