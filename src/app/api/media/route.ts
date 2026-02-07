import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const type = formData.get('type') as string; // 'VIDEO' atau 'PHOTO'
    const albumId = formData.get('albumId') as string;
    const file = formData.get('file') as File;

    if (!file || !albumId) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // 1. Cek keberadaan Album
    const album = await prisma.album.findUnique({
      where: { id: Number(albumId) },
    });

    if (!album) {
      return NextResponse.json({ error: "Folder tidak ditemukan" }, { status: 404 });
    }

    // 2. Persiapan Folder
    const folderName = album.title.toLowerCase().replaceAll(' ', '_');
    const uploadDir = path.join(process.cwd(), 'public/uploads', folderName);
    const tempDir = path.join(process.cwd(), 'public/uploads/temp');
    
    // Pastikan folder ada
    await mkdir(uploadDir, { recursive: true });
    
    // Convert File ke Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // --- LOGIKA VIDEO (Via FFmpeg) ---
    if (type === 'VIDEO') {
      await mkdir(tempDir, { recursive: true });
      
      const tempFileName = `temp_${Date.now()}_${file.name.replaceAll(' ', '_')}`;
      const tempFilePath = path.join(tempDir, tempFileName);
      
      // Tulis file mentah ke temp
      await writeFile(tempFilePath, buffer);

      const fileName = `video_${Date.now()}.mp4`;
      const finalFilePath = path.join(uploadDir, fileName);
      const relativePath = `/uploads/${folderName}/${fileName}`;

      // PERBAIKAN UTAMA DI SINI:
      // 1. Tambahkan <NextResponse> pada Promise
      // 2. Gunakan 'await' agar function menunggu promise selesai
      return await new Promise<NextResponse>((resolve, _reject) => {
        ffmpeg(tempFilePath)
          .output(finalFilePath)
          .videoCodec('libx264')
          .size('1280x?') 
          .outputOptions([
            '-crf 28',
            '-preset veryfast',
            '-movflags +faststart',
            '-pix_fmt yuv420p',
            '-profile:v main'
          ])
          .audioCodec('aac')
          .audioBitrate('128k')
          .audioChannels(2)
          .on('end', async () => {
            // Sukses
            if (existsSync(tempFilePath)) await unlink(tempFilePath).catch(() => {});
            
            try {
              const newItem = await prisma.mediaItem.create({
                data: {
                  name: name,
                  type: 'VIDEO',
                  url: relativePath,
                  albumId: Number(albumId),
                },
              });
              resolve(NextResponse.json(newItem));
            } catch (dbError) {
              resolve(NextResponse.json({ error: "Gagal simpan DB" }, { status: 500 }));
            }
          })
          .on('error', async (err) => {
            console.error("FFmpeg Error:", err);
            // Gagal
            if (existsSync(tempFilePath)) await unlink(tempFilePath).catch(() => {});
            
            // PENTING: Jangan gunakan 'reject' untuk response HTTP error,
            // gunakan 'resolve' dengan status 500 agar tipe data tetap NextResponse.
            resolve(NextResponse.json(
              { error: "Gagal kompresi video", details: err.message }, 
              { status: 500 }
            ));
          })
          .run();
      });
    } 
    
    // --- LOGIKA FOTO (Langsung Simpan) ---
    else {
      const fileName = `photo_${Date.now()}_${file.name.replaceAll(' ', '_')}`;
      const finalFilePath = path.join(uploadDir, fileName);
      
      await writeFile(finalFilePath, buffer);

      const newItem = await prisma.mediaItem.create({
        data: {
          name: name,
          type: 'PHOTO',
          url: `/uploads/${folderName}/${fileName}`,
          albumId: Number(albumId),
        },
      });

      return NextResponse.json(newItem);
    }

  } catch (error) {
    console.error("Global Error:", error);
    return NextResponse.json({ error: 'Gagal upload media' }, { status: 500 });
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

    if (!item) return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 404 });

    // Hapus File Fisik
    try {
      const relativePath = item.url.startsWith('/') ? item.url.slice(1) : item.url;
      const filePath = path.join(process.cwd(), 'public', relativePath);
      
      if (existsSync(filePath)) {
        await unlink(filePath);
      }
    } catch (error) {
      console.error("Gagal hapus file fisik (mungkin sudah hilang):", error);
    }

    // Hapus Database
    await prisma.mediaItem.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: 'File berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus file' }, { status: 500 });
  }
}