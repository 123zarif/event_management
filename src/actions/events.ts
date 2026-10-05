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
  judgingCriteria?: JudgingCriterionInput[];
  venue: string;
  eventDate: string; // ISO string
  registrationDeadline: string; // ISO string
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

    if (!data.title || !data.slug || !data.festId || !data.venue) {
      return { success: false, message: 'Please provide all required fields.' };
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

    const event = await prisma.event.create({
      data: {
        festId: data.festId,
        title: data.title.trim(),
        slug: cleanSlug,
        category: data.category || EventCategory.CONTEST,
        categoryId: data.categoryId || null,
        customCategory: data.customCategory?.trim() || null,
        isCompetitive,
        description: data.description.trim(),
        rules: data.rules?.trim() || null,
        rulebookUrl: isCompetitive ? (data.rulebookUrl || null) : null,
        judgingCriteria: isCompetitive && data.judgingCriteria && data.judgingCriteria.length > 0 
          ? (data.judgingCriteria as unknown as Prisma.InputJsonValue) 
          : Prisma.JsonNull,
        venue: data.venue.trim(),
        eventDate: new Date(data.eventDate),
        registrationDeadline: new Date(data.registrationDeadline),
        capacity,
        fee,
        isTeamEvent: data.isTeamEvent,
        minTeamSize: minTeam,
        maxTeamSize: maxTeam,
      },
      include: {
        fest: true,
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
