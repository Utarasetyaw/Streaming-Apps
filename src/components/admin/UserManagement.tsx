'use client';

import { useState, useEffect } from 'react';
import { 
  UserPlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  XMarkIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

interface User {
  id: number;
  username: string;
  status: 'ACTIVE' | 'BANNED' | 'EXPIRED';
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Data States
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    status: 'ACTIVE'
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openModal = (user: User | null = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ username: user.username, password: '', status: user.status });
    } else {
      setEditingUser(null);
      setFormData({ username: '', password: '', status: 'ACTIVE' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editingUser) {
        const res = await fetch('/api/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: editingUser.id,
            username: formData.username,
            password: formData.password,
            status: formData.status
          })
        });
        if (!res.ok) throw new Error('Gagal update user');
      } else {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error('Gagal tambah user');
      }
      await fetchUsers();
      closeModal();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!userToDelete) return;
    try {
      const res = await fetch(`/api/users?id=${userToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUsers();
      } else {
        alert('Gagal menghapus user');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
      ACTIVE: 'bg-green-500/10 text-green-500 border-green-500/20',
      BANNED: 'bg-red-500/10 text-red-500 border-red-500/20',
      EXPIRED: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
    };
    return (
      <span className={`px-2.5 py-1 rounded-md text-[10px] md:text-xs font-bold uppercase tracking-wider border ${styles[status as keyof typeof styles]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="w-full animate-fade-in pb-20 lg:pb-0">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">User Management</h2>
          <p className="text-zinc-500 text-sm mt-1">Kelola akses dan status member.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 active:scale-95"
        >
          <UserPlusIcon className="w-5 h-5" />
          <span>Tambah Member</span>
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-zinc-900 rounded-xl animate-pulse border border-zinc-800" />
          ))}
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="hidden lg:block bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden shadow-xl">
            <table className="w-full text-left">
              <thead className="bg-black/20 text-zinc-400 uppercase text-xs tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-5 font-bold">Username</th>
                  <th className="px-6 py-5 font-bold">Status</th>
                  <th className="px-6 py-5 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-800/30 transition group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-white">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={user.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-100 lg:opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(user)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition" title="Edit">
                           <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => confirmDelete(user)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition" title="Hapus">
                           <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                   <tr>
                     <td colSpan={3} className="px-6 py-12 text-center text-zinc-500">Belum ada user terdaftar.</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="lg:hidden grid gap-4 sm:grid-cols-2">
            {users.map((user) => (
              <div key={user.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-zinc-700 transition">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-lg font-bold text-zinc-400">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg leading-tight">{user.username}</h4>
                      <div className="mt-1.5"><StatusBadge status={user.status} /></div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-zinc-800">
                  <button onClick={() => openModal(user)} className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-blue-400 py-2.5 rounded-xl text-sm font-bold transition">
                    <PencilSquareIcon className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={() => confirmDelete(user)} className="flex-1 flex items-center justify-center gap-2 bg-red-900/10 hover:bg-red-900/20 text-red-500 py-2.5 rounded-xl text-sm font-bold transition border border-red-900/20">
                    <TrashIcon className="w-4 h-4" /> Hapus
                  </button>
                </div>
              </div>
            ))}
            {users.length === 0 && (
               <div className="col-span-full py-12 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-xl">Belum ada user.</div>
            )}
          </div>
        </>
      )}

      {/* --- MODAL ADD/EDIT (DIPERBAIKI: CENTERED & RESPONSIVE) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
            onClick={closeModal} 
          />
          
          {/* Modal Content - Posisi Tengah Aman untuk Mobile */}
          <div className="relative w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header Sticky */}
            <div className="flex justify-between items-center p-6 border-b border-zinc-800/50 bg-zinc-900">
               <h3 className="text-xl font-bold text-white">
                 {editingUser ? 'Edit Member' : 'Tambah Member Baru'}
               </h3>
               <button onClick={closeModal} className="p-2 -mr-2 text-zinc-500 hover:text-white rounded-full hover:bg-zinc-800 transition">
                  <XMarkIcon className="w-6 h-6" />
               </button>
            </div>

            {/* Scrollable Form Area */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Username</label>
                  <input 
                    type="text" 
                    value={formData.username} 
                    onChange={(e) => setFormData({...formData, username: e.target.value})} 
                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition placeholder-zinc-700" 
                    placeholder="Masukkan username"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
                    Password {editingUser && <span className="text-zinc-600 normal-case">(Kosongkan jika tidak diganti)</span>}
                  </label>
                  <input 
                    type="password" 
                    value={formData.password} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition placeholder-zinc-700"
                    placeholder="••••••••" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Status Akun</label>
                  <div className="relative">
                    <select 
                      value={formData.status} 
                      onChange={(e) => setFormData({...formData, status: e.target.value})} 
                      className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white focus:border-red-600 outline-none appearance-none cursor-pointer"
                    >
                      <option value="ACTIVE">ACTIVE (Aktif)</option>
                      <option value="BANNED">BANNED (Blokir)</option>
                      <option value="EXPIRED">EXPIRED (Kadaluarsa)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={closeModal} className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition">Batal</button>
                  <button type="submit" disabled={isSaving} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-900/20 transition disabled:opacity-70">
                    {isSaving ? 'Menyimpan...' : 'Simpan Data'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setIsDeleteModalOpen(false)} />
          
          <div className="relative bg-zinc-900 w-full max-w-sm rounded-2xl border border-zinc-800 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Hapus Member Ini?</h3>
              <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                Anda akan menghapus user <strong className="text-white">{userToDelete?.username}</strong>.<br/>
                Data yang dihapus tidak dapat dikembalikan.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition">
                   Batal
                </button>
                <button onClick={executeDelete} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-900/20 transition">
                   Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}