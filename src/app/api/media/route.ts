import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { mkdir, unlink } from 'fs/promises';
import { createWriteStream, existsSync } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import path from 'path';
import sharp from 'sharp'; // Pastikan sudah npm install sharp

const prisma = new PrismaClient();

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

    if (!album) {
      return NextResponse.json({ error: "Folder tidak ditemukan" }, { status: 404 });
    }

    // Gunakan nama folder asli (Izinkan spasi)
    const folderName = album.title;
    const uploadDir = path.join(process.cwd(), 'public/uploads', folderName);
    
    // Buat folder jika belum ada
    await mkdir(uploadDir, { recursive: true });

    // ==========================================
    // LOGIKA VIDEO (MP4 -> MP4 LANGSUNG)
    // ==========================================
    if (type === 'VIDEO') {
      const fileName = `video_${Date.now()}.mp4`; // Selalu simpan sebagai .mp4
      const finalFilePath = path.join(uploadDir, fileName);
      const relativePath = `/uploads/${folderName}/${fileName}`;

      // PENTING: Gunakan Stream agar RAM tidak jebol saat upload 700MB
      const fileStream = file.stream();
      // @ts-ignore
      await pipeline(Readable.fromWeb(fileStream), createWriteStream(finalFilePath));

      // Simpan ke Database
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
    // LOGIKA FOTO (PNG/JPG -> WEBP)
    // ==========================================
    else {
      const fileName = `photo_${Date.now()}.webp`; // Selalu simpan sebagai .webp
      const finalFilePath = path.join(uploadDir, fileName);
      const relativePath = `/uploads/${folderName}/${fileName}`;
      
      // Convert ke Buffer dulu
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Proses Convert ke WebP menggunakan SHARP
      await sharp(buffer)
        .webp({ quality: 80 }) // Kompresi kualitas 80%
        .toFile(finalFilePath);

      // Simpan ke Database
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

    try {
      const relativePath = decodeURIComponent(item.url.startsWith('/') ? item.url.slice(1) : item.url);
      const filePath = path.join(process.cwd(), 'public', relativePath);
      
      if (existsSync(filePath)) {
        await unlink(filePath);
      }
    } catch (error) {
      console.error("Gagal hapus file fisik:", error);
    }

    await prisma.mediaItem.delete({ where: { id: Number(id) } });

    return NextResponse.json({ message: 'File berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus file' }, { status: 500 });
  }
}