// src/components/admin/upload-movie/modals/AlertModal.tsx
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export default function AlertModal({ isOpen, title, message, type, onClose }: AlertModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
        <div className="text-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            {type === 'success' ? <CheckCircleIcon className="w-8 h-8" /> : <ExclamationTriangleIcon className="w-8 h-8" />}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-zinc-400 text-sm mb-6">{message}</p>
          <button onClick={onClose} className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}