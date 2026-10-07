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
        { error: 'Unauthorized: Only Organizers and Admins can upload event banners.' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const eventSlug = (formData.get('eventSlug') as string) || 'event-banner';

    if (!file) {
      return NextResponse.json({ error: 'No image file uploaded.' }, { status: 400 });
    }

    const filename = file.name.toLowerCase();
    const validExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
    const hasValidExt = validExtensions.some((ext) => filename.endsWith(ext));

    if (!hasValidExt) {
      return NextResponse.json(
        { error: 'Invalid file extension. Only PNG, JPEG, and WebP images are permitted.' },
        { status: 400 }
      );
    }

    const validMimes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid MIME type (${file.type}). Expected image/png, image/jpeg, or image/webp.` },
        { status: 400 }
      );
    }

    // Maximum 10 MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image size exceeds maximum 10 MB limit.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Magic bytes verification
    const isPng =
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47;
    const isJpg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isWebp =
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP';

    if (!isPng && !isJpg && !isWebp) {
      return NextResponse.json(
        { error: 'Corrupt or invalid image file. Binary signature verification failed.' },
        { status: 400 }
      );
    }

    // Target directory
    const uploadDir = path.join(process.cwd(), 'public/uploads/banners');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.name).toLowerCase() || (isPng ? '.png' : isWebp ? '.webp' : '.jpg');
    const cleanSlug = eventSlug.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const safeName = `${cleanSlug}-${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, safeName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/banners/${safeName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: safeName,
      originalName: file.name,
      size: file.size,
      message: 'Banner image successfully verified and uploaded.',
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || 'Failed to process banner image upload.' },
      { status: 500 }
    );
  }
}

