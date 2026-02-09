import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mkdir, unlink } from 'fs/promises';
import { createWriteStream, existsSync, statSync } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import path from 'path';
import sharp from 'sharp';

/**
 * KONFIGURASI SEGMENT (App Router Standard)
 * 1. maxDuration: Izinkan proses berjalan hingga 300 detik (5 menit).
 * 2. dynamic: Memastikan API selalu dieksekusi secara dinamis (tidak di-cache).
 */
export const maxDuration = 300; 
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let finalFilePath = ''; // Variable luar untuk cleanup jika error

  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const albumId = formData.get('albumId') as string;
    const file = formData.get('file') as File;

    if (!file || !albumId) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const album = await prisma.album.findUnique({
      where: { id: Number(albumId) },
    });

    if (!album || !album.thumbnailUrl) {
      return NextResponse.json({ error: "Album tidak ditemukan / Thumbnail kosong" }, { status: 404 });
    }

    // ==========================================
    // 1. SETUP PATH & FOLDER (PM2 Friendly)
    // ==========================================
    const folderPathRelative = path.dirname(album.thumbnailUrl);
    const cleanRelative = folderPathRelative.startsWith('/') ? folderPathRelative.slice(1) : folderPathRelative;
    
    // Gunakan path.resolve agar aman di PM2/Linux
    const uploadDir = path.resolve(process.cwd(), 'public', cleanRelative);
    
    // Debugging Path (Cek logs PM2 jika error mkdir)
    console.log(`📂 Target Folder: ${uploadDir}`);

    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (mkdirError: any) {
      console.error("❌ Gagal buat folder:", mkdirError);
      return NextResponse.json({ 
        error: `Gagal membuat folder. Cek permission server. Path: ${uploadDir}` 
      }, { status: 500 });
    }

    // ==========================================
    // 2. LOGIKA VIDEO (STREAMING)
    // ==========================================
    if (type === 'VIDEO') {
      const fileName = `video_${Date.now()}.mp4`; 
      finalFilePath = path.join(uploadDir, fileName); // Set path global
      const relativePath = `/${cleanRelative}/${fileName}`;

      console.log(`🚀 Mulai streaming upload: ${fileName}`);

      // Ambil stream dari file
      const fileStream = file.stream();

      // Cek apakah stream sudah terkunci/error duluan
      if (fileStream.locked) {
        throw new Error("Stream file terkunci (Locked state).");
      }

      // PROSES PIPELINE (Streaming)
      // Menggunakan try-catch khusus untuk menangkap 'ReadableStream is already closed'
      try {
        // @ts-ignore - Readable.fromWeb kompatibel dengan Node Streams
        await pipeline(Readable.fromWeb(fileStream), createWriteStream(finalFilePath));
      } catch (streamError: any) {
        console.error("⚠️ Stream Error:", streamError);
        
        // Hapus file sisa jika gagal streaming
        if (existsSync(finalFilePath)) await unlink(finalFilePath).catch(() => {});
        
        if (streamError.code === 'ERR_INVALID_STATE' || streamError.message.includes('closed')) {
            return NextResponse.json({ error: "Upload terputus (Timeout/Koneksi). Cek Nginx Config." }, { status: 408 });
        }
        throw streamError;
      }

      // Validasi Akhir
      if (existsSync(finalFilePath)) {
         const stats = statSync(finalFilePath);
         if (stats.size === 0) {
            await unlink(finalFilePath); // Hapus file 0 byte
            throw new Error("File 0 bytes (Gagal Tulis).");
         }
         console.log(`✅ Sukses Upload: ${fileName} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
      } else {
         throw new Error("File fisik tidak ditemukan setelah proses.");
      }

      // Simpan ke DB
      const newItem = await prisma.mediaItem.create({
        data: {
          name: name,
          type: 'VIDEO',
          url: relativePath,
          albumId: Number(albumId),
        },
      });

      return NextResponse.json(newItem);
    } 
    
    // ==========================================
    // 3. LOGIKA FOTO (SHARP)
    // ==========================================
    else {
      const fileName = `img_${Date.now()}.webp`;
      finalFilePath = path.join(uploadDir, fileName);
      const relativePath = `/${cleanRelative}/${fileName}`;
      
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      await sharp(buffer)
        .webp({ quality: 80 }) 
        .toFile(finalFilePath);

      const newItem = await prisma.mediaItem.create({
        data: {
          name: name,
          type: 'PHOTO',
          url: relativePath,
          albumId: Number(albumId),
        },
      });

      return NextResponse.json(newItem);
    }

  } catch (error: any) {
    console.error("🔥 GLOBAL UPLOAD ERROR:", error);
    
    // Cleanup file jika error terjadi di luar blok stream
    if (finalFilePath && existsSync(finalFilePath)) {
        try { await unlink(finalFilePath); } catch (e) {}
    }

    return NextResponse.json(
      { error: error.message || 'Gagal upload media (Internal Server Error)' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID tidak ditemukan' }, { status: 400 });

    const item = await prisma.mediaItem.findUnique({
      where: { id: Number(id) },
    });

    if (!item) return NextResponse.json({ error: 'File tidak ditemukan di database' }, { status: 404 });

    try {
      const rawUrl = item.url.startsWith('/') ? item.url.slice(1) : item.url;
      const decodedUrl = decodeURIComponent(rawUrl);
      
      // Gunakan path.resolve juga di sini
      const filePath = path.resolve(process.cwd(), 'public', decodedUrl);
      
      if (existsSync(filePath)) {
        await unlink(filePath);
      }
    } catch (error) {
      console.error("Gagal hapus file fisik:", error);
    }

    await prisma.mediaItem.delete({ where: { id: Number(id) } });

    return NextResponse.json({ message: 'File berhasil dihapus' });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: 'Gagal menghapus file' }, { status: 500 });
  }
}