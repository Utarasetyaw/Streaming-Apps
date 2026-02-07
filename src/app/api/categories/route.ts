// src/app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. GET: Ambil Semua Kategori
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }, // Urutkan A-Z
      include: {
        _count: {
          select: { albums: true } // Hitung berapa film di kategori ini
        }
      }
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil kategori' }, { status: 500 });
  }
}

// 2. POST: Tambah Kategori
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) return NextResponse.json({ error: 'Nama wajib diisi' }, { status: 400 });

    const newCategory = await prisma.category.create({
      data: { name }
    });

    return NextResponse.json(newCategory);
  } catch (error) {
    return NextResponse.json({ error: 'Kategori mungkin sudah ada' }, { status: 400 });
  }
}

// 3. PUT: Edit Kategori
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name } = body;

    const updatedCategory = await prisma.category.update({
      where: { id: Number(id) },
      data: { name }
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal update kategori' }, { status: 500 });
  }
}

// 4. DELETE: Hapus Kategori
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID Kosong' }, { status: 400 });

    // Hapus kategori
    await prisma.category.delete({
      where: { id: Number(id) }
    });

    return NextResponse.json({ message: 'Berhasil dihapus' });
  } catch (error) {
    // Biasanya error ini muncul jika Kategori masih dipakai oleh Film
    return NextResponse.json({ error: 'Gagal hapus. Mungkin kategori ini masih memiliki film.' }, { status: 500 });
  }
}