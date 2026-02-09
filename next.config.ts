import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  experimental: {
    // PENTING: Izinkan upload file besar (Default cuma 1MB-4MB)
    // Kita set ke 1GB atau lebih sesuai kebutuhan
    serverActions: {
      bodySizeLimit: '1gb',
    },
  },
};

export default nextConfig;