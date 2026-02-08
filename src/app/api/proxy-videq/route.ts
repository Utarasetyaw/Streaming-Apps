import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // 1. Ambil parameter
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const page = searchParams.get('page') || '1';

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // 2. Setup URL & Controller untuk Timeout (Mencegah loading abadi)
    const targetUrl = `https://zeldvorik.ru/videq/api.php?action=search&q=${encodeURIComponent(query)}&page=${page}`;
    
    // Batas waktu tunggu 10 detik. Jika lebih, anggap Maintenance.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(targetUrl, {
        signal: controller.signal, // Pasang sinyal timeout
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      clearTimeout(timeoutId); // Hapus timer jika berhasil fetch

      // Jika server sana merespon tapi error (500/404/503)
      if (!response.ok) {
        throw new Error(`External API Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Cek apakah data valid array/objek (terkadang API maintenance return HTML)
      if (!data) throw new Error("Empty Data");

      return NextResponse.json(data);

    } catch (fetchError: any) {
      // Tangkap Error Fetching (Timeout / Network Error)
      console.error("Fetch Proxy Failed:", fetchError);
      throw fetchError; // Lempar ke catch luar untuk return JSON standard
    }

  } catch (error) {
    console.error("Proxy Final Error:", error);
    
    // 3. RETURN RESPONSE ERROR KHUSUS
    // Frontend akan membaca 'isError: true' dan memunculkan UI Maintenance
    return NextResponse.json({ 
      success: false, 
      isError: true, 
      message: 'Server sedang sibuk atau gangguan.' 
    }, { status: 502 });
  }
}