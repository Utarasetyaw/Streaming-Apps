import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createReadStream, statSync, existsSync } from 'fs';
import path from 'path';

// Helper Mime Type
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.mp4': return 'video/mp4';
    case '.webm': return 'video/webm';
    case '.mkv': return 'video/x-matroska';
    case '.ogg': return 'video/ogg';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.png': return 'image/png';
    case '.gif': return 'image/gif';
    case '.webp': return 'image/webp';
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

    // 1. Validasi Dasar
    if (isNaN(mediaId)) return new NextResponse("Invalid ID", { status: 400 });

    const media = await prisma.mediaItem.findUnique({
      where: { id: mediaId },
    });

    if (!media) return new NextResponse("Media not found", { status: 404 });

    // 2. Tentukan Path Fisik
    const rawUrl = media.url.startsWith('/') ? media.url.slice(1) : media.url;
    const relativeUrl = decodeURIComponent(rawUrl);
    const filePath = path.join(process.cwd(), 'public', relativeUrl);

    if (!existsSync(filePath)) {
      console.error("❌ File fisik hilang:", filePath);
      return new NextResponse("File fisik tidak ditemukan", { status: 404 });
    }

    // 3. Persiapan Streaming
    const stats = statSync(filePath);
    const fileSize = stats.size;
    const range = request.headers.get('range');
    const contentType = getMimeType(filePath);

    // --- DEBUGGING LOG (Cek Terminal VSCode Anda saat play) ---
    // console.log(`📺 Request Video: ${media.name} | Range: ${range || 'Awal'}`);

    // LOGIKA STREAMING VIDEO
    if (range && contentType.startsWith('video/')) {
      // PERBAIKAN: Naikkan chunk size ke 5MB agar player lebih cepat buffer
      const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      
      // Hitung akhir chunk. Jangan kirim sisa file sekaligus jika terlalu besar.
      const requestedEnd = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const end = Math.min(start + CHUNK_SIZE - 1, requestedEnd);

      if (start >= fileSize) {
        return new NextResponse(null, {
          status: 416,
          headers: { 'Content-Range': `bytes */${fileSize}` }
        });
      }

      const contentLength = end - start + 1;
      const fileStream = createReadStream(filePath, { start, end });

      const headers = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': contentLength.toString(),
        'Content-Type': contentType,
        'Content-Disposition': 'inline', 
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      };

      return new NextResponse(fileStream as any, {
        status: 206, // Partial Content
        headers: headers,
      });
    } 
    
    // LOGIKA GAMBAR / DOWNLOAD BIASA (Tanpa Range)
    else {
      const fileStream = createReadStream(filePath);
      return new NextResponse(fileStream as any, {
        status: 200,
        headers: {
          'Content-Length': fileSize.toString(),
          'Content-Type': contentType,
          'Content-Disposition': 'inline',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

  } catch (error) {
    console.error("🔥 Stream Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}