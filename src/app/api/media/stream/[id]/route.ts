import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createReadStream, statSync, existsSync } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Fungsi helper untuk mendeteksi Mime Type berdasarkan ekstensi
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.mp4': return 'video/mp4';
    case '.webm': return 'video/webm';
    case '.ogg': return 'video/ogg';
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
    const mediaId = Number(params.id);

    if (isNaN(mediaId)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const media = await prisma.mediaItem.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      return NextResponse.json({ error: "Media tidak ditemukan" }, { status: 404 });
    }

    // UPDATE PENTING:
    // 1. Hapus slash depan
    // 2. Gunakan decodeURIComponent agar karakter spasi (%20) terbaca sebagai spasi biasa
    const rawUrl = media.url.startsWith('/') ? media.url.slice(1) : media.url;
    const relativeUrl = decodeURIComponent(rawUrl); 
    
    const filePath = path.join(process.cwd(), 'public', relativeUrl);

    if (!existsSync(filePath)) {
      console.error("File 404:", filePath); // Debugging di terminal server
      return NextResponse.json({ error: "File fisik tidak ditemukan di server" }, { status: 404 });
    }

    const stats = statSync(filePath);
    const range = request.headers.get('range');
    
    // UPDATE PENTING: Deteksi tipe otomatis (PNG, JPG, MP4, dll)
    const contentType = getMimeType(filePath);

    // --- LOGIKA STREAMING VIDEO (Range Request) ---
    if (range && contentType.startsWith('video/')) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;

      if (start >= stats.size) {
        return new NextResponse(null, {
          status: 416,
          headers: { 'Content-Range': `bytes */${stats.size}` }
        });
      }

      const chunksize = (end - start) + 1;
      const file = createReadStream(filePath, { start, end });

      const head = {
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize.toString(),
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      };

      return new NextResponse(file as any, {
        status: 206,
        headers: head,
      });
    } 
    
    // --- LOGIKA GAMBAR & DOWNLOAD BIASA ---
    else {
      const head = {
        'Content-Length': stats.size.toString(),
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache gambar agar loading cepat
      };

      const file = createReadStream(filePath);
      return new NextResponse(file as any, {
        status: 200,
        headers: head,
      });
    }
  } catch (error) {
    console.error("Stream Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}