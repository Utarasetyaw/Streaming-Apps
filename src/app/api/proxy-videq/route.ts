import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const page = searchParams.get('page') || '1';

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  // Key Cache Unik untuk Search External
  const cacheKey = `videq:q=${query}|page=${page}`;

  try {
    // ---------------------------------------------------------
    // A. COBA FETCH KE API EXTERNAL (VIDEQ)
    // ---------------------------------------------------------
    const targetUrl = `https://zeldvorik.ru/videq/api.php?action=search&q=${encodeURIComponent(query)}&page=${page}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 Detik Timeout

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`External API error: ${response.status}`);
    }

    const data = await response.json();

    // ---------------------------------------------------------
    // B. SUKSES: SIMPAN KE DATABASE (UPSERT)
    // ---------------------------------------------------------
    try {
      // Kita bungkus data agar seragam
      const cacheData = {
        success: true,
        data: data 
      };

      await (prisma as any).apiCache.upsert({
        where: { key: cacheKey },
        create: {
          key: cacheKey,
          data: cacheData
        },
        update: {
          data: cacheData
        }
      });
    } catch (dbError) {
      console.error("[Proxy DB] Gagal simpan cache:", dbError);
    }

    return NextResponse.json({ success: true, data: data });

  } catch (error) {
    console.error("Proxy External Error, mencoba DB:", error);

    // ---------------------------------------------------------
    // C. GAGAL: AMBIL DARI DATABASE (FALLBACK)
    // ---------------------------------------------------------
    try {
      const cached = await (prisma as any).apiCache.findUnique({
        where: { key: cacheKey }
      });

      if (cached && cached.data) {
        const jsonCache = cached.data as any;
        return NextResponse.json({ 
          success: true, 
          data: jsonCache.data,
          isCached: true 
        });
      }
    } catch (dbReadError) {
      console.error("[Proxy DB] Gagal baca DB:", dbReadError);
    }

    // ---------------------------------------------------------
    // D. TOTAL FAILURE
    // ---------------------------------------------------------
    return NextResponse.json({ 
      success: false, 
      isError: true, 
      message: 'Service Unavailable' 
    }, { status: 502 });
  }
}