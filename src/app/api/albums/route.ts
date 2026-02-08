import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { writeFile, mkdir, rm } from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

// --- GET (Mengambil Data Album) ---
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

    // Manipulasi URL agar menggunakan jalur Stream API
    const safeAlbums = albums.map(album => ({
      ...album,
      
      // Arahkan thumbnail ke API Stream Thumb yang sudah kita perbaiki
      thumbnailUrl: `/api/media/stream/thumb/${album.id}`, 
      
      mediaItems: album.mediaItems.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        // Kita tidak kirim URL asli agar aman & rapi
        // Frontend cukup pakai ID untuk panggil: /api/media/stream/[id]
        createdAt: item.createdAt
      }))
    }));

    return NextResponse.json(safeAlbums);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}

// --- POST (Membuat Album Baru) ---
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

    // UPDATE: Gunakan title asli (JANGAN di-lowercase/replace)
    // Agar konsisten dengan route media
    const folderName = title; 
    const uploadDir = path.join(process.cwd(), 'public/uploads', folderName);
    
    // Buat folder
    await mkdir(uploadDir, { recursive: true });

    // Simpan Thumbnail (Metode Buffer Biasa - Cepat & Simple)
    const bytes = await thumbnailFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Nama file asli saja (tanpa replaceAll)
    const fileName = `thumbnail_${Date.now()}_${thumbnailFile.name}`;
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

// --- DELETE (Hapus Album & Folder) ---
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

    // UPDATE: Gunakan title asli untuk mencari folder yang mau dihapus
    const folderName = album.title; 
    const folderPath = path.join(process.cwd(), 'public/uploads', folderName);

    try {
      // Hapus folder beserta isinya secara paksa
      await rm(folderPath, { recursive: true, force: true });
    } catch (error) {
      console.error("Gagal hapus fisik folder (mungkin sudah hilang):", error);
    }

    // Hapus data di database
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