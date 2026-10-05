import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized: Only Organizers and Admins can upload rulebooks.' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const eventSlug = (formData.get('eventSlug') as string) || 'rulebook';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // 1. Strict extension check
    const filename = file.name.toLowerCase();
    if (!filename.endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only official PDF (.pdf) documents are permitted.' },
        { status: 400 }
      );
    }

    // 2. Strict MIME type check
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Invalid MIME type. File must be application/pdf.' },
        { status: 400 }
      );
    }

    // 3. Max size check (25 MB)
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds maximum 25 MB limit.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Magic bytes verification: First 4 bytes must be %PDF (0x25, 0x50, 0x44, 0x46)
    if (buffer.length < 4 || buffer.subarray(0, 4).toString('ascii') !== '%PDF') {
      return NextResponse.json(
        { error: 'Corrupt or invalid PDF file: PDF signature verification failed.' },
        { status: 400 }
      );
    }

    // Target directory
    const uploadDir = path.join(process.cwd(), 'public/uploads/rulebooks');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const cleanSlug = eventSlug.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const safeName = `${cleanSlug}-${Date.now()}.pdf`;
    const filePath = path.join(uploadDir, safeName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/rulebooks/${safeName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: safeName,
      originalName: file.name,
      size: file.size,
      message: 'PDF Rulebook successfully verified and uploaded.',
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || 'Failed to process PDF upload.' },
      { status: 500 }
    );
  }
}
