import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { writeFile, mkdir, rm } from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

// --- UPDATE DI SINI (GET) ---
export async function GET() {
  try {
    const albums = await prisma.album.findMany({
      include: {
        categories: true,
        mediaItems: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // --- SECURITY FILTER ---
    // Kita buat array baru (safeAlbums) yang strukturnya dimanipulasi
    const safeAlbums = albums.map(album => ({
      ...album,
      
      // 1. Sembunyikan Path Thumbnail Asli
      // Ubah jadi URL stream proxy (pastikan Anda sudah buat route stream thumb di step sebelumnya)
      thumbnailUrl: `/api/media/stream/thumb/${album.id}`, 
      
      // 2. Sembunyikan Path Media Asli
      mediaItems: album.mediaItems.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        // url: item.url,  <-- FIELD INI DIHAPUS/TIDAK DIKIRIM
        // Kita hanya kirim ID. Frontend akan akses via /api/media/stream/[id]
        createdAt: item.createdAt
      }))
    }));

    return NextResponse.json(safeAlbums);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}

// --- POST (Biarkan Tetap Sama / Standar) ---
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    
    const categoryIdsString = formData.get('categoryIds') as string;
    const thumbnailFile = formData.get('thumbnail') as File;

    if (!thumbnailFile || !categoryIdsString) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    let categoryIds: number[] = [];
    try {
      categoryIds = JSON.parse(categoryIdsString).map((id: string | number) => Number(id));
    } catch (e) {
      return NextResponse.json({ error: "Format kategori salah" }, { status: 400 });
    }

    const folderName = title.toLowerCase().replaceAll(' ', '_');
    const uploadDir = path.join(process.cwd(), 'public/uploads', folderName);
    await mkdir(uploadDir, { recursive: true });

    const bytes = await thumbnailFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `thumbnail_${Date.now()}_${thumbnailFile.name.replaceAll(' ', '_')}`;
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const relativePath = `/uploads/${folderName}/${fileName}`;

    const newAlbum = await prisma.album.create({
      data: {
        title: title,
        thumbnailUrl: relativePath,
        categories: {
          connect: categoryIds.map((id) => ({ id })),
        },
      },
      include: {
        categories: true,
      }
    });

    return NextResponse.json(newAlbum);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Gagal upload folder' }, { status: 500 });
  }
}

// --- DELETE (Biarkan Tetap Sama) ---
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });
    }

    const album = await prisma.album.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!album) {
      return NextResponse.json({ error: 'Folder tidak ditemukan' }, { status: 404 });
    }

    const folderName = album.title.toLowerCase().replaceAll(' ', '_');
    const folderPath = path.join(process.cwd(), 'public/uploads', folderName);

    try {
      await rm(folderPath, { recursive: true, force: true });
    } catch (error) {
      console.error(error);
    }

    await prisma.album.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json({ message: 'Folder berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus folder' }, { status: 500 });
  }
}