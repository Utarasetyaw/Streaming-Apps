// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // 1. Validasi Input
    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username dan Password wajib diisi' },
        { status: 400 }
      );
    }

    // 2. Cari User di Database
    const user = await prisma.user.findUnique({
      where: { username: username },
    });

    // 3. Cek apakah user ada & Statusnya ACTIVE
    if (!user) {
      return NextResponse.json(
        { message: 'Username tidak ditemukan' },
        { status: 401 }
      );
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { message: 'Akun Anda telah dinonaktifkan/banned' },
        { status: 403 }
      );
    }

    // 4. Bandingkan Password (Hash vs Plain)
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { message: 'Password salah' },
        { status: 401 }
      );
    }

    // 5. Login Sukses -> Kembalikan Data Role
    return NextResponse.json({
      message: 'Login Berhasil',
      user: {
        username: user.username,
        role: user.role, // "ADMIN" atau "USER"
      },
    });

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}