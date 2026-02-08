import { NextResponse } from 'next/server';
import { getMoviesSecurely } from '@/lib/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('action') || 'trending';
  const page = Number(searchParams.get('page')) || 1;

  // Panggil fungsi secure yang sudah kita pasangi DB Fallback
  const data = await getMoviesSecurely(category, page);

  return NextResponse.json(data);
}