import 'server-only'; 
// Pastikan package 'server-only' terinstall. Jika belum: npm install server-only
// Ini mencegah fungsi ini dipanggil secara tidak sengaja di Client Component.

// =========================================
// 1. TIPE DATA (TYPES)
// =========================================

// Tipe untuk satu item film di halaman list/home
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

// Tipe respons API untuk list film
export interface ApiResponse {
  success: boolean;
  category?: string;
  items: MovieItem[];
  page: number;
  hasMore: boolean;
}

// Tipe untuk pemeran (Cast)
export interface Cast {
  name: string;
  character: string;
  avatar: string;
}

// Tipe untuk detail lengkap film/series
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
  seasons: any[]; // Bisa diperjelas jika butuh struktur season yang ketat
  cast: Cast[];
  country: string;
}

// =========================================
// 2. FUNGSI FETCHING AMAN (SERVER SIDE)
// =========================================

/**
 * Mengambil daftar film berdasarkan Kategori atau Pencarian.
 * URL API disembunyikan di sini dan tidak akan muncul di Network Tab browser.
 */
export async function getMoviesSecurely(category: string, page: number, query?: string): Promise<ApiResponse> {
  let url = '';

  // Logika: Jika ada query, gunakan endpoint search. Jika tidak, gunakan endpoint kategori.
  if (query) {
    url = `https://zeldvorik.ru/apiv3/api.php?action=search&q=${query}&page=${page}`;
  } else {
    const cleanCategory = category.trim();
    url = `https://zeldvorik.ru/apiv3/api.php?action=${cleanCategory}&page=${page}`;
  }

  try {
    const res = await fetch(url, { 
      cache: 'no-store', // Selalu ambil data terbaru (tidak di-cache)
    });
    
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    
    const data = await res.json();
    
    // Normalisasi return value agar aman (mencegah null/undefined crash di UI)
    return {
      success: data.success || false,
      category: data.category || category,
      items: Array.isArray(data.items) ? data.items : [], 
      page: Number(data.page) || page,
      hasMore: data.hasMore !== undefined ? data.hasMore : (data.items && data.items.length > 0)
    };
  } catch (error) {
    console.error("[SecureFetch] List Error:", error);
    // Return objek kosong yang aman jika error, agar website tidak crash
    return { success: false, items: [], page: 1, hasMore: false };
  }
}

/**
 * Mengambil detail lengkap film berdasarkan slug (detailPath).
 */
export async function getMovieDetailSecurely(slug: string): Promise<MovieDetail | null> {
  try {
    const res = await fetch(`https://zeldvorik.ru/apiv3/api.php?action=detail&detailPath=${slug}`, {
      cache: 'no-store',
    });
    
    if (!res.ok) return null;
    
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (error) {
    console.error("[SecureFetch] Detail Error:", error);
    return null;
  }
}