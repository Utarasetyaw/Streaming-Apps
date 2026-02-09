import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mkdir, unlink } from 'fs/promises';
import { createWriteStream, existsSync, statSync } from 'fs'; // Tambah statSync
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import path from 'path';
import sharp from 'sharp';

// --- KONFIGURASI PENTING UNTUK FILE BESAR ---
// 1. Izinkan proses berjalan sampai 5 menit (300 detik) agar upload 700MB tidak timeout
export const maxDuration = 300; 

// 2. Matikan body parser bawaan (opsional di App Router, tapi bagus untuk penegas)
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request) {
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
      return NextResponse.json({ error: "Album tidak ditemukan" }, { status: 404 });
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

      // 1. STREAMING WRITE (Agar RAM server aman)
      const fileStream = file.stream();
      // @ts-ignore
      await pipeline(Readable.fromWeb(fileStream), createWriteStream(finalFilePath));

      // 2. VALIDASI UKURAN FILE SETELAH UPLOAD
      // Kita cek apakah file benar-benar tertulis di disk
      if (existsSync(finalFilePath)) {
         const stats = statSync(finalFilePath);
         // Jika file 0 bytes, berarti gagal total
         if (stats.size === 0) {
            throw new Error("File terupload tapi ukuran 0 bytes (Gagal Tulis).");
         }
         console.log(`✅ Sukses Upload Video: ${fileName} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
      } else {
         throw new Error("File tidak ditemukan setelah proses upload.");
      }

      // 3. Simpan ke Database
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
    // LOGIKA FOTO
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

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: 'Gagal upload media (Cek koneksi/timeout)' }, { status: 500 });
  }
}

// ... (DELETE function tetap sama) ...
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID tidak ditemukan' }, { status: 400 });

    const item = await prisma.mediaItem.findUnique({
      where: { id: Number(id) },
    });

    if (!item) return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 404 });

    try {
      const rawUrl = item.url.startsWith('/') ? item.url.slice(1) : item.url;
      const decodedUrl = decodeURIComponent(rawUrl);
      const filePath = path.join(process.cwd(), 'public', decodedUrl);
      
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