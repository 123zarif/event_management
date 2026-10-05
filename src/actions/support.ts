'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { SupportCategory, SupportPriority, TicketStatus } from '@prisma/client';

export async function createSupportTicket(
  userId: string,
  data: {
    eventId?: string;
    subject: string;
    category: SupportCategory;
    priority: SupportPriority;
    initialMessage: string;
  }
) {
  try {
    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        eventId: data.eventId || null,
        subject: data.subject,
        category: data.category,
        priority: data.priority,
        status: TicketStatus.OPEN,
        messages: {
          create: {
            senderId: userId,
            message: data.initialMessage,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'SUPPORT_TICKET_OPENED',
        entityType: 'SupportTicket',
        entityId: ticket.id,
        actorId: userId,
        metadata: { subject: data.subject, ticketNumber: ticket.ticketNumber },
      },
    });

    revalidatePath('/support');
    revalidatePath('/admin/support');

    return { success: true, message: `Support ticket #${ticket.ticketNumber} created!`, ticket };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, message: err.message || 'Failed to open ticket' };
  }
}

export async function replyToSupportTicket(ticketId: string, senderId: string, message: string) {
  try {
    const ticketMessage = await prisma.ticketMessage.create({
      data: {
        ticketId,
        senderId,
        message,
      },
    });

    // If ticket was resolved or open, update to in progress
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: TicketStatus.IN_PROGRESS,
        updatedAt: new Date(),
      },
    });

    revalidatePath(`/support/${ticketId}`);
    revalidatePath(`/admin/support/${ticketId}`);
    revalidatePath('/admin/support');

    return { success: true, message: 'Reply sent', ticketMessage };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, message: err.message || 'Failed to send reply' };
  }
}

export async function updateSupportTicketStatus(ticketId: string, status: TicketStatus, assignedToId?: string) {
  try {
    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status,
        ...(assignedToId ? { assignedToId } : {}),
      },
    });

    revalidatePath(`/support/${ticketId}`);
    revalidatePath(`/admin/support/${ticketId}`);
    revalidatePath('/admin/support');

    return { success: true, message: `Ticket status updated to ${status}`, ticket: updated };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, message: err.message || 'Failed to update ticket' };
  }
}
