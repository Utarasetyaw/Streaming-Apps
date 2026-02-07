// src/components/admin/upload-movie/types.ts

export interface MediaItem {
  id: number;
  type: 'VIDEO' | 'PHOTO';
  name: string;
  url: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Album {
  id: number;
  title: string;
  thumbnailUrl: string;
  categories: Category[];
  mediaItems: MediaItem[];
}