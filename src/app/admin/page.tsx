'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import UserManagement from '@/components/admin/UserManagement';
import UploadMovie from '@/components/admin/upload-movie/UploadMovie';
import CategoryManagement from '@/components/admin/CategoryManagement';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('users');
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('is_logged_in');
    const userRole = localStorage.getItem('user_role');

    if (!isLoggedIn) {
      router.replace('/login');
    } else if (userRole !== 'ADMIN') {
      router.replace('/dashboard');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = async () => {
    localStorage.removeItem('user_role');
    localStorage.removeItem('is_logged_in');
    localStorage.removeItem('username');
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-500 text-sm animate-pulse">Memverifikasi akses admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex font-sans relative">
      
      {/* 1. SIDEBAR */}
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        handleLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* 2. MAIN CONTENT */}
      {/* Ubah md:ml-64 jadi lg:ml-64 */}
      <main className="flex-1 lg:ml-64 bg-black min-h-screen flex flex-col">
        
        {/* HEADER MOBILE & TABLET (Hanya hilang di Desktop lg) */}
        {/* Ubah md:hidden jadi lg:hidden */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900 sticky top-0 z-20">
          <div className="flex items-center gap-3">
             <button 
              onClick={() => setIsSidebarOpen(true)}
              className="text-zinc-300 hover:text-white"
             >
               <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
             </button>
             <span className="font-bold text-red-600 tracking-tighter uppercase text-lg">
               Admin<span className="text-white">Panel</span>
             </span>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
          {activeTab === 'users' && (
            <div className="animate-in fade-in duration-500">
              <UserManagement />
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="animate-in fade-in duration-500">
              <UploadMovie />
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="animate-in fade-in duration-500">
              <CategoryManagement />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}