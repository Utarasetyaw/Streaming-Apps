import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // 1. Ambil parameter dari URL request frontend
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const page = searchParams.get('page') || '1';

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // 2. Server memanggil API Asli (Ini terjadi di server, tidak terlihat oleh user)
    const targetUrl = `https://zeldvorik.ru/videq/api.php?action=search&q=${encodeURIComponent(query)}&page=${page}`;
    
    const response = await fetch(targetUrl, {
      headers: {
        // Opsional: Tambahkan User-Agent agar tidak diblokir server tujuan
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`External API error: ${response.status}`);
    }

    const data = await response.json();

    // 3. Kembalikan data ke frontend
    return NextResponse.json(data);

  } catch (error) {
    console.error("Proxy Error:", error);
    return NextResponse.json({ error: 'Failed to fetch external data' }, { status: 500 });
  }
}