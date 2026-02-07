'use client';

import { useState } from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleLogout: () => void;
}

export default function UserSidebar({ activeTab, setActiveTab, handleLogout }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'explore', label: 'Explore Movies', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
    { id: 'categories', label: 'Categories', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
  ];

  return (
    <>
      {/* MOBILE HEADER & BURGER */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6 z-[60]">
        <h1 className="text-xl font-bold text-red-600 tracking-tighter uppercase">
          Fineshyt<span className="text-white text-xs">User</span>
        </h1>
        <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2">
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          )}
        </button>
      </div>

      {/* BACKDROP MOBILE */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[50] lg:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR MAIN */}
      <aside className={`
        fixed h-full bg-zinc-950 border-r border-zinc-900 flex flex-col z-[55] transition-transform duration-300
        w-72 lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 border-b border-zinc-900 hidden lg:block">
          <h1 className="text-2xl font-black text-red-600 tracking-tighter uppercase">
            Fineshyt<span className="text-white">User</span>
          </h1>
        </div>
        
        <nav className="flex-1 p-6 space-y-3 mt-20 lg:mt-6">
          {menuItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen(false);
              }}
              className={`w-full text-left px-5 py-4 rounded-xl font-bold transition flex items-center gap-4 ${
                activeTab === item.id 
                  ? 'bg-red-600 text-white shadow-xl shadow-red-900/20 scale-[1.02]' 
                  : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-zinc-900 mb-4">
          <button 
            onClick={handleLogout}
            className="w-full px-5 py-4 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition flex items-center gap-4 group shadow-lg shadow-red-900/20"
          >
            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </div>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}