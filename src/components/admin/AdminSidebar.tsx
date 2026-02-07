'use client';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ 
  activeTab, 
  setActiveTab, 
  handleLogout, 
  isOpen, 
  onClose 
}: SidebarProps) {
  return (
    <>
      {/* 1. OVERLAY GELAP (Muncul di Mobile & Tablet saat sidebar terbuka) */}
      {/* Ubah md:hidden jadi lg:hidden */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/80 z-30 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* 2. SIDEBAR UTAMA */}
      <aside 
        className={`
          fixed top-0 left-0 h-full w-64 bg-zinc-900 border-r border-zinc-800 z-40
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 
        `}
      >
        {/* Header Sidebar */}
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-red-600 tracking-tighter uppercase">
            Admin<span className="text-white">Panel</span>
          </h1>
          
          {/* Tombol Close (X) - Muncul di Mobile & Tablet */}
          <button onClick={onClose} className="lg:hidden text-zinc-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
          <button 
            onClick={() => { setActiveTab('users'); onClose(); }}
            className={`w-full text-left px-4 py-3 rounded-lg font-bold transition flex items-center gap-3 ${
              activeTab === 'users' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            User Management
          </button>

          <button 
            onClick={() => { setActiveTab('categories'); onClose(); }}
            className={`w-full text-left px-4 py-3 rounded-lg font-bold transition flex items-center gap-3 ${
              activeTab === 'categories' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            Manage Categories
          </button>

          <button 
            onClick={() => { setActiveTab('upload'); onClose(); }}
            className={`w-full text-left px-4 py-3 rounded-lg font-bold transition flex items-center gap-3 ${
              activeTab === 'upload' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            Content & Folder
          </button>
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button 
            onClick={handleLogout}
            className="w-full px-4 py-3 text-sm font-bold text-zinc-500 hover:text-red-500 hover:bg-red-950/20 rounded-lg transition flex items-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}