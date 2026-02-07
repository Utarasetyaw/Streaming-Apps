import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // <--- INI WAJIB ADA AGAR CSS JALAN

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Movie Streaming",
  description: "Platform streaming",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}