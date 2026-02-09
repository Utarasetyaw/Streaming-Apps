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
 * 1. maxDuration: Izinkan proses berjalan hingga 300 detik (untuk upload file besar).
 * 2. dynamic: Memastikan API selalu dieksekusi secara dinamis (tidak di-cache).
 */
export const maxDuration = 300; 
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Di App Router, request.formData() sudah mendukung streaming secara internal.
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
      return NextResponse.json({ error: "Album tidak ditemukan atau tidak memiliki thumbnail" }, { status: 404 });
    }

    // Setup Folder
    const folderPathRelative = path.dirname(album.thumbnailUrl);
    const cleanRelative = folderPathRelative.startsWith('/') ? folderPathRelative.slice(1) : folderPathRelative;
    const uploadDir = path.join(process.cwd(), 'public', cleanRelative);
    
    await mkdir(uploadDir, { recursive: true });

    // ==========================================
    // LOGIKA VIDEO
    // ==========================================
    if (type === 'VIDEO') {
      const fileName = `video_${Date.now()}.mp4`; 
      const finalFilePath = path.join(uploadDir, fileName);
      const relativePath = `/${cleanRelative}/${fileName}`;

      // STREAMING WRITE (Sangat penting untuk file > 100MB agar tidak crash)
      const fileStream = file.stream();
      
      // Mengonversi Web Stream ke Node Readable Stream agar bisa di-pipeline
      // @ts-ignore
      await pipeline(Readable.fromWeb(fileStream), createWriteStream(finalFilePath));

      // Validasi file setelah upload selesai
      if (existsSync(finalFilePath)) {
         const stats = statSync(finalFilePath);
         if (stats.size === 0) {
            throw new Error("File terupload tapi ukuran 0 bytes.");
         }
         console.log(`✅ Sukses Upload Video: ${fileName} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);
      } else {
         throw new Error("File tidak ditemukan setelah proses streaming selesai.");
      }

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
    // LOGIKA FOTO (Konversi ke WebP)
    // ==========================================
    else {
      const fileName = `img_${Date.now()}.webp`;
      const finalFilePath = path.join(uploadDir, fileName);
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
    console.error("Upload Error:", error);
    return NextResponse.json(
      { error: error.message || 'Gagal upload media' }, 
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

    // Hapus file fisik dari folder public
    try {
      const rawUrl = item.url.startsWith('/') ? item.url.slice(1) : item.url;
      const decodedUrl = decodeURIComponent(rawUrl);
      const filePath = path.join(process.cwd(), 'public', decodedUrl);
      
      if (existsSync(filePath)) {
        await unlink(filePath);
      }
    } catch (error) {
      console.error("Gagal hapus file fisik:", error);
      // Lanjutkan hapus record DB meskipun file fisik gagal dihapus
    }

    await prisma.mediaItem.delete({ where: { id: Number(id) } });

    return NextResponse.json({ message: 'File dan record berhasil dihapus' });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: 'Gagal menghapus media' }, { status: 500 });
  }
}