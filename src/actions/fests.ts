'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { FestStatus } from '@prisma/client';

export interface CreateFestInput {
  title: string;
  slug: string;
  description: string;
  location: string;
  startDate: string; // ISO string
  endDate: string;   // ISO string
  status?: FestStatus;
  bannerUrl?: string;
  organizationId?: string;
}

export async function createFest(data: CreateFestInput) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
      return {
        success: false,
        message: 'Unauthorized: Only Organizers and Admins can create festivals and events.',
      };
    }

    if (!data.title || !data.slug || !data.location || !data.startDate || !data.endDate) {
      return {
        success: false,
        message: 'Please provide all required fields (title, slug, location, start and end dates).',
      };
    }

    // Slug sanitization
    const cleanSlug = data.slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const existing = await prisma.fest.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return {
        success: false,
        message: `A festival or event with slug "${cleanSlug}" already exists. Please choose a different identifier.`,
      };
    }

    // Resolve organization
    let orgId = data.organizationId;
    if (!orgId) {
      const defaultOrg = await prisma.organization.findFirst({
        orderBy: { createdAt: 'asc' },
      });
      if (!defaultOrg) {
        return {
          success: false,
          message: 'No active Organization found to host this festival.',
        };
      }
      orgId = defaultOrg.id;
    }

    const fest = await prisma.fest.create({
      data: {
        title: data.title.trim(),
        slug: cleanSlug,
        description: data.description.trim(),
        location: data.location.trim(),
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: data.status || FestStatus.UPCOMING,
        bannerUrl: data.bannerUrl?.trim() || null,
        organizationId: orgId,
      },
      include: {
        organization: true,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        action: 'FEST_CREATED',
        entityType: 'Fest',
        entityId: fest.id,
        actorId: user.id,
        metadata: {
          title: fest.title,
          slug: fest.slug,
          location: fest.location,
          status: fest.status,
          organization: fest.organization.name,
        },
      },
    });

    revalidatePath('/fests');
    revalidatePath(`/fests/${fest.slug}`);
    revalidatePath('/admin');
    revalidatePath('/admin/events/new');
    revalidatePath('/api/fests/list');

    return {
      success: true,
      message: `Festival "${fest.title}" published successfully!`,
      festSlug: fest.slug,
      festId: fest.id,
    };
  } catch (error: unknown) {
    const err = error as Error;
    return {
      success: false,
      message: err.message || 'Failed to create festival.',
    };
  }
}

export async function getAllFests() {
  return prisma.fest.findMany({
    orderBy: { startDate: 'desc' },
    include: {
      organization: true,
      _count: {
        select: { events: true },
      },
    },
  });
}

export interface UpdateFestInput {
  title?: string;
  slug?: string;
  description?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  status?: FestStatus;
  bannerUrl?: string;
  organizationId?: string;
}

export async function updateFest(festId: string, data: UpdateFestInput) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
      return {
        success: false,
        message: 'Unauthorized: Only Organizers and Admins can update festivals.',
      };
    }

    const fest = await prisma.fest.findUnique({
      where: { id: festId },
      include: { organization: true },
    });

    if (!fest) {
      return { success: false, message: 'Festival not found.' };
    }

    const cleanTitle = data.title ? data.title.trim() : fest.title;
    const cleanSlug = data.slug
      ? data.slug
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9-]+/g, '-')
          .replace(/^-+|-+$/g, '')
      : fest.slug;

    if (cleanSlug !== fest.slug) {
      const existing = await prisma.fest.findUnique({ where: { slug: cleanSlug } });
      if (existing) {
        return {
          success: false,
          message: `A festival with slug "${cleanSlug}" already exists.`,
        };
      }
    }

    const updated = await prisma.fest.update({
      where: { id: festId },
      data: {
        title: cleanTitle,
        slug: cleanSlug,
        description: data.description !== undefined ? data.description.trim() : fest.description,
        location: data.location !== undefined ? data.location.trim() : fest.location,
        startDate: data.startDate ? new Date(data.startDate) : fest.startDate,
        endDate: data.endDate ? new Date(data.endDate) : fest.endDate,
        status: data.status || fest.status,
        bannerUrl: data.bannerUrl !== undefined ? (data.bannerUrl.trim() || null) : fest.bannerUrl,
        organizationId: data.organizationId || fest.organizationId,
      },
      include: { organization: true },
    });

    await prisma.auditLog.create({
      data: {
        action: 'FEST_UPDATED',
        entityType: 'Fest',
        entityId: updated.id,
        actorId: user.id,
        metadata: {
          title: updated.title,
          slug: updated.slug,
          status: updated.status,
          updatedByName: user.name,
        },
      },
    });

    revalidatePath('/fests');
    revalidatePath(`/fests/${fest.slug}`);
    revalidatePath(`/fests/${updated.slug}`);
    revalidatePath('/admin');
    revalidatePath('/events');

    return {
      success: true,
      message: `Festival "${updated.title}" updated successfully!`,
      festSlug: updated.slug,
      festId: updated.id,
    };
  } catch (error: unknown) {
    const err = error as Error;
    return {
      success: false,
      message: err.message || 'Failed to update festival.',
    };
  }
}

export async function deleteFest(festId: string) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
      return {
        success: false,
        message: 'Unauthorized: Only Organizers and Admins can delete festivals.',
      };
    }

    const fest = await prisma.fest.findUnique({
      where: { id: festId },
      include: {
        _count: {
          select: {
            events: true,
          },
        },
      },
    });

    if (!fest) {
      return { success: false, message: 'Festival not found.' };
    }

    // Delete the festival (cascades to all associated events and their child records)
    await prisma.fest.delete({
      where: { id: festId },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        action: 'FEST_DELETED',
        entityType: 'Fest',
        entityId: festId,
        actorId: user.id,
        metadata: {
          title: fest.title,
          slug: fest.slug,
          deletedByName: user.name,
          deletedByEmail: user.email,
          eventCount: fest._count.events,
        },
      },
    });

    revalidatePath('/fests');
    revalidatePath(`/fests/${fest.slug}`);
    revalidatePath('/admin');
    revalidatePath('/events');
    revalidatePath('/leaderboards');

    return {
      success: true,
      message: `Festival "${fest.title}" and its ${fest._count.events} associated event(s) have been deleted.`,
    };
  } catch (error: unknown) {
    const err = error as Error;
    return {
      success: false,
      message: err.message || 'Failed to delete festival.',
    };
  }
}

