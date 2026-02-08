import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir, rm } from 'fs/promises';
import path from 'path';

function sanitizeFolderName(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_');
}

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

    const safeAlbums = albums.map(album => ({
      ...album,
      thumbnailUrl: `/api/media/stream/thumb/${album.id}`,
      mediaItems: album.mediaItems.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        createdAt: item.createdAt
      }))
    }));

    return NextResponse.json(safeAlbums);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const categoryIdsString = formData.get('categoryIds') as string;
    const thumbnailFile = formData.get('thumbnail') as File;

    if (!title || !thumbnailFile || !categoryIdsString) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    let categoryIds: number[] = [];
    try {
      categoryIds = JSON.parse(categoryIdsString).map((id: string | number) => Number(id));
    } catch (e) {
      return NextResponse.json({ error: "Format kategori salah" }, { status: 400 });
    }

    const cleanTitle = sanitizeFolderName(title);
    const uniqueSuffix = Date.now().toString().slice(-6);
    const folderName = `${cleanTitle}_${uniqueSuffix}`;
    
    const uploadDir = path.join(process.cwd(), 'public/uploads', folderName);
    
    await mkdir(uploadDir, { recursive: true });

    const bytes = await thumbnailFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(thumbnailFile.name) || '.jpg';
    const fileName = `thumbnail${ext}`;
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
    return NextResponse.json({ error: 'Gagal membuat album' }, { status: 500 });
  }
}

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
      return NextResponse.json({ error: 'Album tidak ditemukan' }, { status: 404 });
    }

    const folderPathRelative = path.dirname(album.thumbnailUrl);
    const cleanRelative = folderPathRelative.startsWith('/') ? folderPathRelative.slice(1) : folderPathRelative;
    const fullFolderPath = path.join(process.cwd(), 'public', cleanRelative);

    try {
      await rm(fullFolderPath, { recursive: true, force: true });
    } catch (error) {
      console.error(error);
    }

    await prisma.album.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json({ message: 'Album dan folder berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus album' }, { status: 500 });
  }
}