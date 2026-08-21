"use client";

import Link from 'next/link';
import { ArrowRight, ArrowLeft, Loader2, ShieldAlert } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('smada_user_id');
    const role = localStorage.getItem('smada_user_role');
    if (userId) {
      router.replace(role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [router]);

  const hashPassword = async (text: string) => {
    const msgBuffer = new TextEncoder().encode(text + "SMADA50K_SECURE_SALT_99");
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const hashedPassword = await hashPassword(password);
      
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('identifier', identifier)
        .eq('password', hashedPassword)
        .single();

      if (error || !user) {
        toast.error("ID Admin atau Password salah!");
        setIsLoading(false);
        return;
      }

      if (user.role !== 'admin') {
        toast.error("Akses Ditolak! Akun ini bukan akun Panitia.");
        setIsLoading(false);
        return;
      }

      // Simpan sesi ke localStorage
      localStorage.setItem('smada_user_id', user.id);
      localStorage.setItem('smada_user_name', user.name);
      localStorage.setItem('smada_user_role', user.role);
      
      toast.success(`Selamat datang, Admin ${user.name}!`);
      router.push('/admin');
      
    } catch (err) {
      toast.error("Terjadi kesalahan jaringan.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-4 relative font-sans w-full py-12 md:py-20">
      <Link href="/" className="absolute top-6 left-6 text-zinc-400 hover:text-red-500 flex items-center gap-2 font-bold uppercase tracking-wider z-20 transition-colors">
        <ArrowLeft size={20} /> Kembali
      </Link>

      <div className="max-w-md w-full bg-zinc-900/90 backdrop-blur-xl rounded-3xl border border-red-500/30 p-8 space-y-8 relative z-10 shadow-[0_0_40px_rgba(239,68,68,0.15)] mx-auto overflow-hidden">
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 rounded-full mix-blend-screen filter blur-[80px] opacity-20 pointer-events-none"></div>

        <div className="text-center space-y-2 relative z-10">
          <div className="flex justify-center mb-4">
             <ShieldAlert size={56} className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
          </div>
          <h2 className="text-xl font-black text-white tracking-widest uppercase">Admin Portal</h2>
          <p className="text-xs text-red-400 font-medium tracking-wide">
            Login khusus Panitia SMADA50K
          </p>
        </div>

        <form className="space-y-5 relative z-10" onSubmit={handleLogin}>
          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-wider">ID Admin</label>
            <input 
              type="text" 
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Masukkan ID Admin" 
              className="w-full px-4 py-4 bg-zinc-950 rounded-xl border border-zinc-800 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none font-medium"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full px-4 py-4 bg-zinc-950 rounded-xl border border-zinc-800 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none font-medium"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-red-600 text-white font-black uppercase tracking-wider py-4 rounded-xl flex justify-center items-center gap-2 hover:bg-red-700 transition shadow-[0_0_15px_rgba(239,68,68,0.4)] mt-4 disabled:opacity-50"
          >
            {isLoading ? <><Loader2 size={20} className="animate-spin" /> VERIFIKASI...</> : <>MASUK PANEL ADMIN <ArrowRight size={20} /></>}
          </button>
        </form>

        <div className="pt-6 text-center border-t border-zinc-800 relative z-10">
          <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors font-medium">
            Bukan Panitia? <span className="text-orange-500 font-bold">Login Peserta di sini</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
