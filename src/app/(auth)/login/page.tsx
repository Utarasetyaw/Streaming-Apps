// src/app/(auth)/login/page.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/solid'; // Pastikan install heroicons

export default function LoginPage() {
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login gagal');
      }

      localStorage.setItem('is_logged_in', 'true');
      localStorage.setItem('user_role', data.user.role);
      localStorage.setItem('username', data.user.username);

      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060606] px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Effect (Opsional: agar tidak terlalu polos) */}
      <div className="absolute inset-0 z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/10 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      {/* Form Card */}
      <div className="w-full max-w-md space-y-8 bg-zinc-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-zinc-800 shadow-2xl relative z-10">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Fineshyt<span className="text-red-600">.</span>
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Masuk untuk mengakses koleksi premium
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm px-4 py-3 rounded-lg text-center animate-shake">
              {error}
            </div>
          )}

          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="relative block w-full rounded-lg border border-zinc-700 bg-black/50 px-4 py-3 text-white placeholder-zinc-500 focus:z-10 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm transition-colors"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full rounded-lg border border-zinc-700 bg-black/50 px-4 py-3 text-white placeholder-zinc-500 focus:z-10 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm transition-colors"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {/* Tombol Login */}
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative flex w-full justify-center rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-red-700 hover:shadow-lg hover:shadow-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${isLoading ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Masuk Sekarang'
              )}
            </button>

            {/* Tombol Kembali ke Home (Secondary Button) */}
            <Link 
              href="/"
              className="group flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-transparent px-4 py-3 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white focus:outline-none"
            >
              <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Kembali ke Beranda
            </Link>
          </div>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-zinc-500">
          Belum punya akun?{' '}
          <Link href="https://t.me/Jocc16" target="_blank" className="font-medium text-red-500 hover:text-red-400 transition-colors">
            Hubungi Admin
          </Link>
        </div>

      </div>
    </div>
  );
}