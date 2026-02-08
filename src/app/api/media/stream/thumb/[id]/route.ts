import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // <--- PERBAIKAN: Gunakan Singleton
import { createReadStream, statSync, existsSync } from 'fs';
import path from 'path';

// Helper untuk deteksi tipe gambar otomatis (JPG/PNG/WEBP/GIF)
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.png': return 'image/png';
    case '.gif': return 'image/gif';
    case '.webp': return 'image/webp';
    case '.svg': return 'image/svg+xml';
    default: return 'application/octet-stream';
  }
}

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

    if (!album || !album.thumbnailUrl) {
      return new NextResponse("Thumbnail not found", { status: 404 });
    }

    // 2. Tentukan Path Fisik File
    // Buang slash depan jika ada
    const rawUrl = album.thumbnailUrl.startsWith('/') ? album.thumbnailUrl.slice(1) : album.thumbnailUrl;
    
    // PENTING: Decode URL agar spasi (%20) terbaca sebagai spasi biasa oleh sistem file
    const relativeUrl = decodeURIComponent(rawUrl);
    
    const filePath = path.join(process.cwd(), 'public', relativeUrl);

    // 3. Cek apakah file ada
    if (!existsSync(filePath)) {
      // console.error("Thumb 404:", filePath); // Uncomment untuk debug
      return new NextResponse("File not found on server", { status: 404 });
    }

    // 4. Stream File ke Browser
    const stats = statSync(filePath);
    const file = createReadStream(filePath);
    
    // Deteksi tipe konten otomatis
    const contentType = getMimeType(filePath);

    return new NextResponse(file as any, {
      headers: {
        'Content-Type': contentType, // Jangan dipaksa jpeg, sesuaikan file aslinya
        'Content-Length': stats.size.toString(),
        // Cache agresif (1 tahun) karena thumbnail jarang berubah
        'Cache-Control': 'public, max-age=31536000, immutable' 
      }
    });

  } catch (error) {
    console.error("Thumbnail Stream Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}