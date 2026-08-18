"use client";

import Link from 'next/link';
import { ArrowLeft, Loader2, UserCog, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [classGroup, setClassGroup] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem('smada_user_id');
      if (!userId) {
        router.push('/login');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (error || !data) throw error;

        setName(data.name || '');
        setClassGroup(data.class_group || '');
        setIdentifier(data.identifier || '');
        setRole(data.role || '');
        setEmail(data.email || '');
      } catch (err) {
        toast.error("Gagal memuat data profil.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const toastId = toast.loading('Menyimpan perubahan...');

    try {
      const userId = localStorage.getItem('smada_user_id');
      const { error } = await supabase
        .from('users')
        .update({ 
           name, 
           class_group: classGroup 
        })
        .eq('id', userId);

      if (error) throw error;

      // Update local storage
      localStorage.setItem('smada_user_name', name);
      localStorage.setItem('smada_user_class', classGroup);

      toast.success('Profil berhasil diperbarui!', { id: toastId });
      router.push('/dashboard');
    } catch (err) {
      toast.error('Gagal memperbarui profil.', { id: toastId });
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-orange-500">
        <Loader2 size={40} className="animate-spin mb-4" />
        <h2 className="font-bold tracking-widest uppercase">Memuat Profil...</h2>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-4 relative font-sans w-full py-12 md:py-20">
      <Link href="/dashboard" className="absolute top-6 left-6 text-zinc-400 hover:text-orange-500 flex items-center gap-2 font-bold uppercase tracking-wider z-20 transition-colors">
        <ArrowLeft size={20} /> Kembali
      </Link>

      <div className="max-w-md w-full bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-zinc-800 p-8 space-y-8 relative z-10 shadow-2xl mx-auto">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6 text-orange-500">
             <UserCog size={48} strokeWidth={1.5} className="drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]" />
          </div>
        
          <h2 className="text-sm font-bold text-center text-zinc-400 tracking-widest uppercase mb-1">
            Pengaturan Profil
          </h2>
          <p className="text-xs text-zinc-500 font-medium">
            Perbarui Nama atau Kelas Anda jika terdapat kesalahan saat mendaftar.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleUpdate}>
          {/* IDENTIFIER & EMAIL (LOCKED) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">NISN / NIP (Tidak bisa diubah)</label>
            <input 
              type="text" 
              value={identifier}
              disabled
              className="w-full px-4 py-3 bg-zinc-950/50 rounded-xl border border-zinc-800/50 text-zinc-500 font-medium cursor-not-allowed"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Email (Tidak bisa diubah)</label>
            <input 
              type="email" 
              value={email}
              disabled
              className="w-full px-4 py-3 bg-zinc-950/50 rounded-xl border border-zinc-800/50 text-zinc-500 font-medium cursor-not-allowed"
            />
          </div>

          <div className="border-t border-zinc-800/50 pt-4 mt-2"></div>

          {/* EDITABLE FIELDS */}
          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-wider">Nama Lengkap</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama lengkap..." 
              className="w-full px-4 py-4 bg-zinc-950 rounded-xl border border-zinc-800 text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none font-medium"
              required
            />
          </div>

          {role !== 'admin' && (
             <div className="space-y-2">
               <label className="text-xs font-black text-zinc-400 uppercase tracking-wider">Kelas / Kategori</label>
               <input 
                 type="text" 
                 value={classGroup}
                 onChange={(e) => setClassGroup(e.target.value)}
                 placeholder="Cth: X-1, XI-IPA, Guru" 
                 className="w-full px-4 py-4 bg-zinc-950 rounded-xl border border-zinc-800 text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none font-medium"
                 required
               />
             </div>
          )}

          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full bg-orange-500 text-white font-black uppercase tracking-wider py-4 rounded-xl flex justify-center items-center gap-2 hover:bg-orange-600 transition shadow-[0_0_15px_rgba(249,115,22,0.3)] mt-4 disabled:opacity-50"
          >
            {isSaving ? <><Loader2 size={20} className="animate-spin" /> Menyimpan...</> : <>Simpan Profil <Check size={20} /></>}
          </button>
        </form>

      </div>
    </div>
  );
}
