'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { EventCategory, Prisma } from '@prisma/client';

export interface JudgingCriterionInput {
  id: string;
  name: string;
  maxScore: number;
  description?: string;
}

export interface CreateEventInput {
  festId: string;
  title: string;
  slug: string;
  category: EventCategory;
  categoryId?: string;
  customCategory?: string;
  isCompetitive?: boolean;
  description: string;
  rules?: string;
  rulebookUrl?: string;
  bannerUrl?: string;
  judgingCriteria?: JudgingCriterionInput[];
  venue?: string;
  isDateUndecided?: boolean;
  hasSpecificTime?: boolean;
  eventDate?: string; // ISO string or undefined
  registrationDeadline?: string; // ISO string or undefined
  isRulebookPublished?: boolean;
  isJudgingPublished?: boolean;
  capacity: number;
  fee?: number;
  isTeamEvent: boolean;
  minTeamSize?: number;
  maxTeamSize?: number;
}

export async function createEvent(data: CreateEventInput) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
      return {
        success: false,
        message: 'Unauthorized: Only Organizers and Admins can create events and competitions.',
      };
    }

    if (!data.title || !data.slug || !data.festId) {
      return { success: false, message: 'Please provide all required fields (Festival, Title, Slug).' };
    }

    // Slug sanitize
    const cleanSlug = data.slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');

    const existing = await prisma.event.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return { success: false, message: `An event with slug "${cleanSlug}" already exists. Please choose a different slug.` };
    }

    const isCompetitive = data.isCompetitive !== undefined ? data.isCompetitive : true;

    // Rulebook check: If provided, must be a .pdf
    if (data.rulebookUrl && !data.rulebookUrl.toLowerCase().endsWith('.pdf')) {
      return { success: false, message: 'Invalid rulebook format: Strictly PDF documents (.pdf) only.' };
    }

    // Capacity check
    const capacity = Number(data.capacity) || 50;
    const fee = Number(data.fee) || 0;
    const minTeam = data.isTeamEvent ? Math.max(1, Number(data.minTeamSize) || 1) : 1;
    const maxTeam = data.isTeamEvent ? Math.max(minTeam, Number(data.maxTeamSize) || 4) : 1;

    const isDateUndecided = !!data.isDateUndecided;
    const hasSpecificTime = data.hasSpecificTime !== undefined ? data.hasSpecificTime : true;
    const parsedEventDate = !isDateUndecided && data.eventDate ? new Date(data.eventDate) : null;
    const parsedDeadline = !isDateUndecided && data.registrationDeadline ? new Date(data.registrationDeadline) : null;

    const event = await prisma.event.create({
      data: {
        festId: data.festId,
        createdById: user.id,
        title: data.title.trim(),
        slug: cleanSlug,
        category: data.category || EventCategory.CONTEST,
        categoryId: data.categoryId || null,
        customCategory: data.customCategory?.trim() || null,
        isCompetitive,
        description: data.description.trim(),
        rules: data.rules?.trim() || null,
        rulebookUrl: isCompetitive ? (data.rulebookUrl || null) : null,
        bannerUrl: data.bannerUrl?.trim() || null,
        isRulebookPublished: data.isRulebookPublished !== undefined ? data.isRulebookPublished : true,
        isJudgingPublished: data.isJudgingPublished !== undefined ? data.isJudgingPublished : true,
        judgingCriteria: isCompetitive && data.judgingCriteria && data.judgingCriteria.length > 0 
          ? (data.judgingCriteria as unknown as Prisma.InputJsonValue) 
          : Prisma.JsonNull,
        venue: data.venue?.trim() ? data.venue.trim() : null,
        isDateUndecided,
        hasSpecificTime,
        eventDate: parsedEventDate,
        registrationDeadline: parsedDeadline,
        capacity,
        fee,
        isTeamEvent: data.isTeamEvent,
        minTeamSize: minTeam,
        maxTeamSize: maxTeam,
      },
      include: {
        fest: true,
        creator: true,
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        action: isCompetitive ? 'COMPETITION_CREATED' : 'EVENT_CREATED',
        entityType: 'Event',
        entityId: event.id,
        actorId: user.id,
        metadata: {
          title: event.title,
          slug: event.slug,
          category: event.category,
          isCompetitive: event.isCompetitive,
          categoryId: event.categoryId,
          capacity: event.capacity,
          rulebookUrl: event.rulebookUrl,
          hasCriteria: !!data.judgingCriteria?.length,
          createdByName: user.name,
        },
      },
    });

    revalidatePath('/events');
    revalidatePath(`/events/${event.slug}`);
    revalidatePath('/admin');
    revalidatePath(`/fests/${event.fest.slug}`);

    return {
      success: true,
      message: `${isCompetitive ? 'Competition' : 'Event'} "${event.title}" published successfully!`,
      eventSlug: event.slug,
    };
  } catch (error: unknown) {
    const err = error as Error;
    return {
      success: false,
      message: err.message || 'Failed to create competition.',
    };
  }
}

export async function togglePublishStatus(
  eventId: string, 
  field: 'rulebook' | 'judging', 
  publish: boolean
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
      return { success: false, message: 'Unauthorized' };
    }

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: field === 'rulebook' ? { isRulebookPublished: publish } : { isJudgingPublished: publish },
    });

    revalidatePath(`/events/${updated.slug}`);
    revalidatePath('/admin');

    return {
      success: true,
      message: `${field === 'rulebook' ? 'Rulebook' : 'Judging criteria'} ${publish ? 'published' : 'unpublished'}.`,
    };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, message: err.message };
  }
}

export async function getFestsForSelection() {
  return prisma.fest.findMany({
    orderBy: { startDate: 'asc' },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
    },
  });
}

export interface UpdateEventInput {
  festId?: string;
  title?: string;
  slug?: string;
  category?: EventCategory;
  categoryId?: string;
  customCategory?: string;
  isCompetitive?: boolean;
  description?: string;
  rules?: string;
  rulebookUrl?: string;
  bannerUrl?: string;
  judgingCriteria?: JudgingCriterionInput[];
  venue?: string;
  isDateUndecided?: boolean;
  hasSpecificTime?: boolean;
  eventDate?: string;
  registrationDeadline?: string;
  isRulebookPublished?: boolean;
  isJudgingPublished?: boolean;
  capacity?: number;
  fee?: number;
  isTeamEvent?: boolean;
  minTeamSize?: number;
  maxTeamSize?: number;
}

export async function updateEvent(eventId: string, data: UpdateEventInput) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
      return {
        success: false,
        message: 'Unauthorized: Only Organizers and Admins can edit events and competitions.',
      };
    }

    const currentEvent = await prisma.event.findUnique({
      where: { id: eventId },
      include: { fest: true },
    });

    if (!currentEvent) {
      return { success: false, message: 'Event not found.' };
    }

    let cleanSlug = currentEvent.slug;
    if (data.slug && data.slug !== currentEvent.slug) {
      cleanSlug = data.slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-');

      const existing = await prisma.event.findUnique({
        where: { slug: cleanSlug },
      });

      if (existing && existing.id !== eventId) {
        return { success: false, message: `An event with slug "${cleanSlug}" already exists.` };
      }
    }

    // Rulebook check: If provided, must be a .pdf
    if (data.rulebookUrl && !data.rulebookUrl.toLowerCase().endsWith('.pdf')) {
      return { success: false, message: 'Invalid rulebook format: Strictly PDF documents (.pdf) only.' };
    }

    const isCompetitive = data.isCompetitive !== undefined ? data.isCompetitive : currentEvent.isCompetitive;
    const isTeamEvent = data.isTeamEvent !== undefined ? data.isTeamEvent : currentEvent.isTeamEvent;
    const minTeam = isTeamEvent ? Math.max(1, Number(data.minTeamSize ?? currentEvent.minTeamSize) || 1) : 1;
    const maxTeam = isTeamEvent ? Math.max(minTeam, Number(data.maxTeamSize ?? currentEvent.maxTeamSize) || 4) : 1;
    const capacity = data.capacity !== undefined ? Number(data.capacity) || 50 : currentEvent.capacity;
    const fee = data.fee !== undefined ? Number(data.fee) || 0 : currentEvent.fee;

    const isDateUndecided = data.isDateUndecided !== undefined ? !!data.isDateUndecided : currentEvent.isDateUndecided;
    const hasSpecificTime = data.hasSpecificTime !== undefined ? data.hasSpecificTime : currentEvent.hasSpecificTime;
    const parsedEventDate = !isDateUndecided && data.eventDate ? new Date(data.eventDate) : (isDateUndecided ? null : currentEvent.eventDate);
    const parsedDeadline = !isDateUndecided && data.registrationDeadline ? new Date(data.registrationDeadline) : (isDateUndecided ? null : currentEvent.registrationDeadline);

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: {
        festId: data.festId || currentEvent.festId,
        title: data.title ? data.title.trim() : currentEvent.title,
        slug: cleanSlug,
        category: data.category || currentEvent.category,
        categoryId: data.categoryId !== undefined ? (data.categoryId || null) : currentEvent.categoryId,
        customCategory: data.customCategory !== undefined ? (data.customCategory?.trim() || null) : currentEvent.customCategory,
        isCompetitive,
        description: data.description !== undefined ? data.description.trim() : currentEvent.description,
        rules: data.rules !== undefined ? (data.rules?.trim() || null) : currentEvent.rules,
        rulebookUrl: isCompetitive ? (data.rulebookUrl !== undefined ? (data.rulebookUrl || null) : currentEvent.rulebookUrl) : null,
        bannerUrl: data.bannerUrl !== undefined ? (data.bannerUrl?.trim() || null) : currentEvent.bannerUrl,
        isRulebookPublished: data.isRulebookPublished !== undefined ? data.isRulebookPublished : currentEvent.isRulebookPublished,
        isJudgingPublished: data.isJudgingPublished !== undefined ? data.isJudgingPublished : currentEvent.isJudgingPublished,
        judgingCriteria: isCompetitive && data.judgingCriteria && data.judgingCriteria.length > 0
          ? (data.judgingCriteria as unknown as Prisma.InputJsonValue)
          : (data.judgingCriteria !== undefined ? Prisma.JsonNull : (currentEvent.judgingCriteria ? (currentEvent.judgingCriteria as Prisma.InputJsonValue) : Prisma.JsonNull)),
        venue: data.venue !== undefined ? (data.venue?.trim() || null) : currentEvent.venue,
        isDateUndecided,
        hasSpecificTime,
        eventDate: parsedEventDate,
        registrationDeadline: parsedDeadline,
        capacity,
        fee,
        isTeamEvent,
        minTeamSize: minTeam,
        maxTeamSize: maxTeam,
      },
      include: {
        fest: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'EVENT_UPDATED',
        entityType: 'Event',
        entityId: updated.id,
        actorId: user.id,
        metadata: {
          title: updated.title,
          slug: updated.slug,
          isRulebookPublished: updated.isRulebookPublished,
          isJudgingPublished: updated.isJudgingPublished,
          updatedByName: user.name,
        },
      },
    });

    revalidatePath('/events');
    revalidatePath(`/events/${currentEvent.slug}`);
    revalidatePath(`/events/${updated.slug}`);
    revalidatePath('/admin');
    revalidatePath(`/fests/${currentEvent.fest.slug}`);

    return {
      success: true,
      message: `Event "${updated.title}" updated successfully!`,
      eventSlug: updated.slug,
    };
  } catch (error: unknown) {
    const err = error as Error;
    return {
      success: false,
      message: err.message || 'Failed to update event.',
    };
  }
}

export async function deleteEvent(eventId: string) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
      return {
        success: false,
        message: 'Unauthorized: Only Organizers and Admins can delete events and competitions.',
      };
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        fest: true,
        _count: {
          select: {
            registrations: true,
            submissions: true,
            assignedJudges: true,
          },
        },
      },
    });

    if (!event) {
      return { success: false, message: 'Event not found.' };
    }

    // Delete the event (cascades to registrations, teams, submissions, judge scores, assigned judges)
    await prisma.event.delete({
      where: { id: eventId },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        action: 'EVENT_DELETED',
        entityType: 'Event',
        entityId: eventId,
        actorId: user.id,
        metadata: {
          title: event.title,
          slug: event.slug,
          festTitle: event.fest?.title,
          deletedByName: user.name,
          deletedByEmail: user.email,
          registrationCount: event._count.registrations,
          submissionCount: event._count.submissions,
        },
      },
    });

    revalidatePath('/events');
    revalidatePath(`/events/${event.slug}`);
    revalidatePath('/admin');
    if (event.fest?.slug) {
      revalidatePath(`/fests/${event.fest.slug}`);
    }
    revalidatePath('/leaderboards');

    return {
      success: true,
      message: `Competition track "${event.title}" has been permanently deleted.`,
    };
  } catch (error: unknown) {
    const err = error as Error;
    return {
      success: false,
      message: err.message || 'Failed to delete event.',
    };
  }
}

