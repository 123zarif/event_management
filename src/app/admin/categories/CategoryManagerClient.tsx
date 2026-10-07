'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createCategory, deleteCategory, updateCategory } from '@/actions/categories';
import { 
  ArrowLeft, 
  FolderPlus, 
  Tag, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Loader2,
  Pencil
} from 'lucide-react';
import { toast } from 'sonner';

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  color?: string | null;
  eventCount: number;
  createdAt: string;
}

interface CategoryManagerClientProps {
  initialCategories: CategoryItem[];
}

export function CategoryManagerClient({ initialCategories }: CategoryManagerClientProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Form states for Create
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('violet');

  // Form states for Edit
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editColor, setEditColor] = useState('violet');

  const [loading, setLoading] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(autoSlug);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a category name.');
      return;
    }

    setLoading(true);

    try {
      const res = await createCategory({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        color,
      });

      if (!res.success || !res.category) {
        toast.error(res.message);
        setLoading(false);
        return;
      }

      toast.success(res.message);
      setCategories((prev) => [
        ...prev,
        {
          id: res.category.id,
          name: res.category.name,
          slug: res.category.slug,
          description: res.category.description,
          color: res.category.color,
          eventCount: 0,
          createdAt: res.category.createdAt.toISOString(),
        },
      ]);

      setName('');
      setSlug('');
      setDescription('');
      setShowCreateModal(false);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to create category.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;

    setLoading(true);

    try {
      const res = await deleteCategory(id);
      if (!res.success) {
        toast.error(res.message);
        setLoading(false);
        return;
      }

      toast.success(res.message);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to delete category.');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditDescription(cat.description || '');
    setEditColor(cat.color || 'violet');
  };

  const handleEditNameChange = (val: string) => {
    setEditName(val);
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setEditSlug(autoSlug);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    if (!editName.trim()) {
      toast.error('Please enter a category name.');
      return;
    }

    setLoading(true);

    try {
      const res = await updateCategory(editingCategory.id, {
        name: editName.trim(),
        slug: editSlug.trim(),
        description: editDescription.trim(),
        color: editColor,
      });

      if (!res.success || !res.category) {
        toast.error(res.message);
        setLoading(false);
        return;
      }

      toast.success(res.message);
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? {
                ...c,
                name: res.category.name,
                slug: res.category.slug,
                description: res.category.description,
                color: res.category.color,
              }
            : c
        )
      );

      setEditingCategory(null);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to update category.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Organizer Command Center
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
              Taxonomy Engine
            </span>
            <span className="text-xs text-zinc-500 font-mono">Event Classification</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1 flex items-center gap-2">
            <Tag className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            Category Management
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            Create and organize categories for competitions and general festival events. New categories automatically appear in directory filters.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors shadow-xs shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-xs flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                  {cat.slug}
                </span>
                <span className="text-xs font-mono text-zinc-500">
                  {cat.eventCount} {cat.eventCount === 1 ? 'event' : 'events'}
                </span>
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                {cat.name}
              </h3>
              {cat.description && (
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800 text-xs">
              <Link
                href={`/events?category=${cat.slug.toUpperCase()}`}
                className="text-violet-600 dark:text-violet-400 hover:underline font-medium"
              >
                View Events →
              </Link>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openEditModal(cat)}
                  disabled={loading}
                  className="p-1 text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer"
                  title="Edit category"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>

                {cat.eventCount === 0 ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(cat.id, cat.name)}
                    disabled={loading}
                    className="p-1 text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                    title="Delete unused category"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <span className="text-[10px] text-zinc-400 font-mono">Linked</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-5 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <FolderPlus className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Create New Category
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Cybersecurity & CTF"
                  required
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="cybersecurity-ctf"
                  required
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of events under this classification..."
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                  Badge Color Accent
                </label>
                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none"
                >
                  <option value="violet">Electric Violet</option>
                  <option value="emerald">Emerald Green</option>
                  <option value="cyan">Cyan Blue</option>
                  <option value="amber">Amber Gold</option>
                  <option value="rose">Rose Red</option>
                  <option value="indigo">Indigo Purple</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-md bg-violet-600 hover:bg-violet-700 text-white font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Create Category</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal (Item 37) */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-5 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Pencil className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Edit Category: {editingCategory.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingCategory(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-base"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => handleEditNameChange(e.target.value)}
                  placeholder="e.g. Cybersecurity & CTF"
                  required
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  placeholder="cybersecurity-ctf"
                  required
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Summary of events under this classification..."
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                  Badge Color Accent
                </label>
                <select
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none"
                >
                  <option value="violet">Electric Violet</option>
                  <option value="emerald">Emerald Green</option>
                  <option value="cyan">Cyan Blue</option>
                  <option value="amber">Amber Gold</option>
                  <option value="rose">Rose Red</option>
                  <option value="indigo">Indigo Purple</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-md bg-violet-600 hover:bg-violet-700 text-white font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Update Category</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
