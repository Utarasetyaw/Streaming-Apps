// src/app/api/users/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// 1. GET: Ambil Semua User (Kecuali Admin Utama)
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: 'USER' // Hanya ambil yang role-nya USER, Admin jangan ditampilkan biar aman
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        status: true,
        createdAt: true
      }
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data users' }, { status: 500 });
  }
}

// 2. POST: Tambah User Baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, status } = body;

    // Cek apakah username sudah ada
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return NextResponse.json({ error: 'Username sudah digunakan!' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        status: status || 'ACTIVE', // Default ACTIVE
        role: 'USER'
      }
    });

    return NextResponse.json(newUser);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menambah user' }, { status: 500 });
  }
}

// 3. PUT: Edit User (Status / Password)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, username, password, status } = body;

    let updateData: any = { username, status };

    // Jika password diisi, hash ulang. Jika kosong, biarkan password lama.
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: updateData
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal update user' }, { status: 500 });
  }
}

// 4. DELETE: Hapus User
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID tidak ditemukan' }, { status: 400 });

    await prisma.user.delete({
      where: { id: Number(id) }
    });

    return NextResponse.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus user' }, { status: 500 });
  }
}