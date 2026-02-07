import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createReadStream, statSync, existsSync } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const albumId = Number(params.id);

    if (isNaN(albumId)) {
      return new NextResponse("Invalid ID", { status: 400 });
    }

    // 1. Cari Album di Database
    const album = await prisma.album.findUnique({
      where: { id: albumId },
    });

    if (!album) {
      return new NextResponse("Album not found", { status: 404 });
    }

    // 2. Tentukan Path Fisik File
    // album.thumbnailUrl di database masih "/uploads/..."
    // Kita buang "/" di depan agar path.join tidak error
    const relativeUrl = album.thumbnailUrl.startsWith('/') ? album.thumbnailUrl.slice(1) : album.thumbnailUrl;
    const filePath = path.join(process.cwd(), 'public', relativeUrl);

    // 3. Cek apakah file ada
    if (!existsSync(filePath)) {
      return new NextResponse("File not found on server", { status: 404 });
    }

    // 4. Stream File ke Browser
    const stats = statSync(filePath);
    const file = createReadStream(filePath);

    return new NextResponse(file as any, {
      headers: {
        'Content-Type': 'image/jpeg', // Asumsi thumbnail jpeg/png
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'public, max-age=3600, must-revalidate' // Cache 1 jam agar cepat
      }
    });

  } catch (error) {
    console.error("Thumbnail Stream Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}