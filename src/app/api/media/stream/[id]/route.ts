import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // <--- PERBAIKAN: Gunakan import Singleton
import { createReadStream, statSync, existsSync } from 'fs';
import path from 'path';

// Fungsi helper untuk mendeteksi Mime Type
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

    // UPDATE: Membersihkan URL path
    const rawUrl = media.url.startsWith('/') ? media.url.slice(1) : media.url;
    
    // Decode URI agar spasi (%20) terbaca sebagai spasi biasa di sistem file
    const relativeUrl = decodeURIComponent(rawUrl); 
    
    // Gabungkan dengan path folder public
    const filePath = path.join(process.cwd(), 'public', relativeUrl);

    if (!existsSync(filePath)) {
      // console.error("File 404:", filePath); // Uncomment untuk debug
      return NextResponse.json({ error: "File fisik tidak ditemukan" }, { status: 404 });
    }

    const stats = statSync(filePath);
    const range = request.headers.get('range');
    const contentType = getMimeType(filePath);

    // --- LOGIKA STREAMING VIDEO (Support Range / Seeking) ---
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
        // Penting agar browser memutar video (inline), bukan download
        'Content-Disposition': 'inline', 
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      };

      return new NextResponse(file as any, {
        status: 206, // Partial Content
        headers: head,
      });
    } 
    
    // --- LOGIKA GAMBAR & DOWNLOAD BIASA ---
    else {
      const head = {
        'Content-Length': stats.size.toString(),
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Content-Disposition': 'inline', // Tampilkan di browser
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache agresif untuk gambar
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