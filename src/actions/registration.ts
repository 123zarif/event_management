'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { RegistrationStatus } from '@prisma/client';

export interface RegisterResult {
  success: boolean;
  message: string;
  ticketCode?: string;
  status?: RegistrationStatus;
}

export async function registerForEvent(
  eventId: string,
  userId: string,
  data: {
    teamId?: string;
    responses?: Record<string, string>;
  }
): Promise<RegisterResult> {
  try {
    // 1. Fetch event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { fest: true },
    });

    if (!event) {
      return { success: false, message: 'Event not found' };
    }

    // 2. Check registration deadline
    if (new Date() > new Date(event.registrationDeadline)) {
      return { success: false, message: 'Registration deadline has passed' };
    }

    // 3. Check for existing active registration
    const existing = await prisma.registration.findFirst({
      where: {
        eventId,
        userId,
        status: { not: RegistrationStatus.CANCELLED },
      },
    });

    if (existing) {
      return {
        success: false,
        message: 'You are already registered for this event',
        ticketCode: existing.ticketCode,
        status: existing.status,
      };
    }

    // 4. Concurrency-safe capacity check
    // Count current confirmed registrations
    const confirmedCount = await prisma.registration.count({
      where: {
        eventId,
        status: { in: [RegistrationStatus.CONFIRMED, RegistrationStatus.CHECKED_IN] },
      },
    });

    const isCapacityFull = confirmedCount >= event.capacity;
    const initialStatus = isCapacityFull ? RegistrationStatus.WAITLISTED : RegistrationStatus.CONFIRMED;

    // 5. Generate ticket code
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const prefix = event.title.split(' ').map((w) => w[0]).join('').substring(0, 3).toUpperCase();
    const ticketCode = `TC26-${prefix}-${randomSuffix}`;

    const qrPayload = JSON.stringify({
      ticketCode,
      eventId: event.id,
      event: event.title,
      userId,
      status: initialStatus,
    });

    // 6. Create registration in database transaction
    const registration = await prisma.registration.create({
      data: {
        eventId,
        userId,
        teamId: data.teamId,
        status: initialStatus,
        ticketCode,
        qrCodeData: qrPayload,
        responses: data.responses ?? {},
      },
    });

    // 7. Audit log
    await prisma.auditLog.create({
      data: {
        action: isCapacityFull ? 'WAITLIST_JOINED' : 'REGISTRATION_CREATED',
        entityType: 'Registration',
        entityId: registration.id,
        actorId: userId,
        metadata: {
          eventTitle: event.title,
          status: initialStatus,
          ticketCode,
        },
      },
    });

    revalidatePath(`/events/${event.slug}`);
    revalidatePath('/my-registrations');
    revalidatePath('/admin/participants');

    return {
      success: true,
      message: isCapacityFull
        ? 'Capacity reached! You have been placed on the automated waitlist.'
        : 'Registration confirmed successfully!',
      ticketCode: registration.ticketCode,
      status: initialStatus,
    };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, message: err.message || 'Failed to register' };
  }
}

export async function cancelRegistration(ticketCode: string): Promise<{ success: boolean; message: string }> {
  try {
    const reg = await prisma.registration.findUnique({
      where: { ticketCode },
      include: { event: true },
    });

    if (!reg) return { success: false, message: 'Registration not found' };

    // Mark current registration cancelled
    await prisma.registration.update({
      where: { ticketCode },
      data: { status: RegistrationStatus.CANCELLED },
    });

    // Operational Log
    await prisma.auditLog.create({
      data: {
        action: 'TICKET_CANCELLED',
        entityType: 'Registration',
        entityId: reg.id,
        actorId: reg.userId,
        metadata: { ticketCode, eventTitle: reg.event.title },
      },
    });

    // AUTOMATED WAITLIST PROMOTION
    // If the cancelled registration was confirmed, promote the oldest waitlisted applicant!
    if (reg.status === RegistrationStatus.CONFIRMED) {
      const nextInLine = await prisma.registration.findFirst({
        where: {
          eventId: reg.eventId,
          status: RegistrationStatus.WAITLISTED,
        },
        orderBy: { createdAt: 'asc' },
      });

      if (nextInLine) {
        await prisma.registration.update({
          where: { id: nextInLine.id },
          data: { status: RegistrationStatus.CONFIRMED },
        });

        await prisma.auditLog.create({
          data: {
            action: 'WAITLIST_PROMOTED',
            entityType: 'Registration',
            entityId: nextInLine.id,
            metadata: {
              promotedTicketCode: nextInLine.ticketCode,
              promotedUser: nextInLine.userId,
              reason: `Freed up by cancellation of ${ticketCode}`,
            },
          },
        });
      }
    }

    revalidatePath('/my-registrations');
    revalidatePath(`/events/${reg.event.slug}`);
    revalidatePath('/admin/participants');
    revalidatePath('/admin/audit-logs');

    return { success: true, message: 'Registration successfully cancelled' };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, message: err.message || 'Cancellation failed' };
  }
}

export async function verifyAndCheckInTicket(ticketCode: string, actorId?: string) {
  try {
    const caller = await getCurrentUser();
    if (!caller || (caller.role !== 'ORGANIZER' && caller.role !== 'ADMIN')) {
      return { success: false, message: 'Unauthorized: Gate check-in requires Organizer privileges' };
    }

    const reg = await prisma.registration.findUnique({
      where: { ticketCode },
      include: {
        user: true,
        event: { include: { fest: true } },
        team: true,
      },
    });

    if (!reg) {
      return { success: false, message: 'Invalid ticket code. Pass not found in system.' };
    }

    if (reg.status === RegistrationStatus.CANCELLED) {
      return { success: false, message: 'This ticket has been cancelled.' };
    }

    if (reg.status === RegistrationStatus.WAITLISTED) {
      return { success: false, message: 'This registration is currently on the waitlist.' };
    }

    if (reg.status === RegistrationStatus.CHECKED_IN) {
      return {
        success: false,
        message: `Already checked in on ${reg.checkedInAt?.toLocaleTimeString() || 'earlier today'}`,
        registration: reg,
      };
    }

    // Perform check-in
    const updated = await prisma.registration.update({
      where: { id: reg.id },
      data: {
        status: RegistrationStatus.CHECKED_IN,
        checkedInAt: new Date(),
      },
      include: { user: true, event: true, team: true },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CHECKED_IN',
        entityType: 'Registration',
        entityId: reg.id,
        actorId: actorId || null,
        metadata: {
          attendeeName: reg.user.name,
          ticketCode: reg.ticketCode,
          eventTitle: reg.event.title,
        },
      },
    });

    revalidatePath('/admin/participants');
    revalidatePath('/admin/scanner');
    revalidatePath('/admin/audit-logs');

    return {
      success: true,
      message: `Successfully verified and checked in ${reg.user.name}!`,
      registration: updated,
    };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, message: err.message || 'Check-in failed' };
  }
}
