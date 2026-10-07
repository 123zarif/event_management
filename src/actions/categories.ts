'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  color?: string;
}

export async function createCategory(data: CreateCategoryInput) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
      return {
        success: false,
        message: 'Unauthorized: Only Organizers and Admins can create categories.',
      };
    }

    if (!data.name || data.name.trim().length === 0) {
      return { success: false, message: 'Category name is required.' };
    }

    const cleanName = data.name.trim();
    const cleanSlug = (data.slug || cleanName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ name: cleanName }, { slug: cleanSlug }],
      },
    });

    if (existing) {
      return {
        success: false,
        message: `Category "${cleanName}" or slug "${cleanSlug}" already exists.`,
      };
    }

    const category = await prisma.category.create({
      data: {
        name: cleanName,
        slug: cleanSlug,
        description: data.description?.trim() || null,
        color: data.color || 'violet',
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CATEGORY_CREATED',
        entityType: 'Category',
        entityId: category.id,
        actorId: user.id,
        metadata: { name: category.name, slug: category.slug },
      },
    });

    revalidatePath('/events');
    revalidatePath('/admin/events/new');
    revalidatePath('/admin/categories');

    return {
      success: true,
      message: `Category "${category.name}" created successfully!`,
      category,
    };
  } catch (error: unknown) {
    const err = error as Error;
    return {
      success: false,
      message: err.message || 'Failed to create category.',
    };
  }
}

export async function getAllCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { events: true },
      },
    },
  });
}

export async function deleteCategory(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
      return { success: false, message: 'Unauthorized' };
    }

    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { events: true } } },
    });

    if (!category) {
      return { success: false, message: 'Category not found.' };
    }

    if (category._count.events > 0) {
      return {
        success: false,
        message: `Cannot delete category "${category.name}" because it is currently linked to ${category._count.events} events. Reassign those events first.`,
      };
    }

    await prisma.category.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: 'CATEGORY_DELETED',
        entityType: 'Category',
        entityId: id,
        actorId: user.id,
        metadata: { name: category.name },
      },
    });

    revalidatePath('/events');
    revalidatePath('/admin/categories');

    return { success: true, message: `Category "${category.name}" deleted.` };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, message: err.message || 'Failed to delete category.' };
  }
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string;
  color?: string;
}

export async function updateCategory(id: string, data: UpdateCategoryInput) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
      return { success: false, message: 'Unauthorized: Only Organizers and Admins can update categories.' };
    }

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return { success: false, message: 'Category not found.' };
    }

    const cleanName = data.name ? data.name.trim() : category.name;
    const cleanSlug = data.slug
      ? data.slug
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      : category.slug;

    // Check collision if name or slug changed
    if (cleanName !== category.name || cleanSlug !== category.slug) {
      const existing = await prisma.category.findFirst({
        where: {
          id: { not: id },
          OR: [{ name: cleanName }, { slug: cleanSlug }],
        },
      });
      if (existing) {
        return { success: false, message: `Another category with name "${cleanName}" or slug "${cleanSlug}" already exists.` };
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: cleanName,
        slug: cleanSlug,
        description: data.description !== undefined ? (data.description.trim() || null) : category.description,
        color: data.color || category.color,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CATEGORY_UPDATED',
        entityType: 'Category',
        entityId: id,
        actorId: user.id,
        metadata: { name: updated.name, slug: updated.slug },
      },
    });

    revalidatePath('/events');
    revalidatePath('/admin/events/new');
    revalidatePath('/admin/categories');

    return { success: true, message: `Category "${updated.name}" updated successfully!`, category: updated };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, message: err.message || 'Failed to update category.' };
  }
}

