import 'server-only'; 

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
  isError?: boolean; // Penanda jika API mati
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

export async function getMoviesSecurely(category: string, page: number, query?: string): Promise<ApiResponse> {
  let url = '';

  if (query) {
    url = `https://zeldvorik.ru/apiv3/api.php?action=search&q=${query}&page=${page}`;
  } else {
    const cleanCategory = category.trim();
    url = `https://zeldvorik.ru/apiv3/api.php?action=${cleanCategory}&page=${page}`;
  }

  try {
    const res = await fetch(url, { 
      cache: 'no-store', 
    });
    
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    
    const data = await res.json();
    
    return {
      success: data.success || false,
      category: data.category || category,
      items: Array.isArray(data.items) ? data.items : [], 
      page: Number(data.page) || page,
      hasMore: data.hasMore !== undefined ? data.hasMore : (data.items && data.items.length > 0),
      isError: false
    };
  } catch (error) {
    console.error("[SecureFetch] List Error:", error);
    // Return object dengan isError: true
    return { 
      success: false, 
      items: [], 
      page: 1, 
      hasMore: false, 
      isError: true 
    };
  }
}

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