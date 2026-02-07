import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createReadStream, statSync, existsSync } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> } // UPDATE 1: Definisi tipe Promise
) {
  try {
    // UPDATE 2: Await params sebelum digunakan
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

    // UPDATE 3: Normalisasi Path (Hapus slash depan jika ada)
    // Agar path.join tidak bingung menggabungkan path
    const relativeUrl = media.url.startsWith('/') ? media.url.slice(1) : media.url;
    const filePath = path.join(process.cwd(), 'public', relativeUrl);

    // Debugging: Cek path di terminal jika video masih error
    // console.log("Streaming File:", filePath); 

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "File fisik tidak ditemukan di server" }, { status: 404 });
    }

    const stats = statSync(filePath);
    const range = request.headers.get('range');
    const contentType = media.type === 'VIDEO' ? 'video/mp4' : 'image/jpeg';

    if (range && media.type === 'VIDEO') {
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
    } else {
      const head = {
        'Content-Length': stats.size.toString(),
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
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