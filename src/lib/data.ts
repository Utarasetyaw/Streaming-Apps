import 'server-only'; 
import { prisma } from '@/lib/prisma';

// =========================================
// TIPE DATA (TYPES)
// =========================================

export interface MovieItem {
  id: string;
  title: string;
  poster: string;
  rating: string;
  year: string;
  type: string;
  genre: string;
  detailPath: string;
}

export interface ApiResponse {
  success: boolean;
  category?: string;
  items: MovieItem[];
  page: number;
  hasMore: boolean;
  isError?: boolean;
}

export interface Cast {
  name: string;
  character: string;
  avatar: string;
}

export interface MovieDetail {
  id: string;
  title: string;
  poster: string;
  rating: string;
  year: string;
  type: string;
  genre: string;
  description: string;
  playerUrl: string;
  seasons: any[]; 
  cast: Cast[];
  country: string;
}

// =========================================
// 1. FETCH LIST MOVIE (DENGAN DB CACHE)
// =========================================

export async function getMoviesSecurely(category: string, page: number, query?: string): Promise<ApiResponse> {
  const cleanCat = category ? category.trim() : '';
  const cleanQ = query ? query.trim() : '';
  const cacheKey = `cat:${cleanCat}|page:${page}|q:${cleanQ}`;

  let url = '';
  if (cleanQ) {
    url = `https://zeldvorik.ru/apiv3/api.php?action=search&q=${cleanQ}&page=${page}`;
  } else {
    url = `https://zeldvorik.ru/apiv3/api.php?action=${cleanCat}&page=${page}`;
  }

  try {
    // A. COBA FETCH API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, { 
      cache: 'no-store',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    
    const rawData = await res.json();
    
    const freshData: ApiResponse = {
      success: rawData.success || false,
      category: rawData.category || category,
      items: Array.isArray(rawData.items) ? rawData.items : [], 
      page: Number(rawData.page) || page,
      hasMore: rawData.hasMore !== undefined ? rawData.hasMore : (rawData.items && rawData.items.length > 0),
      isError: false
    };

    // B. SUKSES: SIMPAN KE DB
    try {
      await (prisma as any).apiCache.upsert({
        where: { key: cacheKey },
        create: {
          key: cacheKey,
          data: freshData as any
        },
        update: {
          data: freshData as any
        }
      });
    } catch (dbError) {
      console.error("[DB Cache List] Gagal simpan (Non-fatal):", dbError);
    }

    return freshData;

  } catch (externalError) {
    console.error("[SecureFetch List] External API Gagal, mencoba DB:", externalError);

    // C. GAGAL: AMBIL DARI DB
    try {
      const cached = await (prisma as any).apiCache.findUnique({
        where: { key: cacheKey }
      });

      if (cached && cached.data) {
        const cachedData = cached.data as unknown as ApiResponse;
        return {
          ...cachedData,
          isError: false 
        };
      }
    } catch (dbReadError) {
      console.error("[DB Cache List] Gagal baca DB:", dbReadError);
    }

    // D. TOTAL FAILURE
    return { 
      success: false, 
      items: [], 
      page: 1, 
      hasMore: false, 
      isError: true 
    };
  }
}

// =========================================
// 2. FETCH MOVIE DETAIL (DENGAN DB CACHE)
// =========================================

export async function getMovieDetailSecurely(slug: string): Promise<MovieDetail | null> {
  const cacheKey = `detail:${slug}`;

  try {
    // A. COBA FETCH API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`https://zeldvorik.ru/apiv3/api.php?action=detail&detailPath=${slug}`, {
      cache: 'no-store',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    
    const json = await res.json();
    
    if (json.success && json.data) {
      const freshData = json.data;

      // B. SUKSES: SIMPAN KE DB
      try {
        await (prisma as any).apiCache.upsert({
          where: { key: cacheKey },
          create: {
            key: cacheKey,
            data: freshData
          },
          update: {
            data: freshData
          }
        });
      } catch (dbError) {
        console.error("[DB Cache Detail] Gagal simpan:", dbError);
      }

      return freshData;
    }
    
    return null;

  } catch (externalError) {
    console.error("[SecureFetch Detail] External API Gagal, mencoba DB:", externalError);

    // C. GAGAL: AMBIL DARI DB
    try {
      const cached = await (prisma as any).apiCache.findUnique({
        where: { key: cacheKey }
      });

      if (cached && cached.data) {
        return cached.data as unknown as MovieDetail;
      }
    } catch (dbReadError) {
      console.error("[DB Cache Detail] Gagal baca DB:", dbReadError);
    }

    return null;
  }
}