"use client";

import Link from 'next/link';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('smada_user_id');
    const role = localStorage.getItem('smada_user_role');
    if (userId) {
      router.replace(role === 'admin' ? '/admin' : '/dashboard');
    } else {
      setIsChecking(false);
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
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', hashedPassword)
        .single();
        
      if (error || !data) {
        toast.error("Email atau Password salah!");
      } else {
        localStorage.setItem('smada_user_id', data.id);
        localStorage.setItem('smada_user_name', data.name);
        localStorage.setItem('smada_user_class', data.class_group);
        localStorage.setItem('smada_user_role', data.role);
        
        toast.success(`Selamat datang, ${data.name}!`);
        
        if (data.role === 'admin') {
           router.push('/admin');
        } else {
           router.push('/dashboard');
        }
      }
    } catch (err) {
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) return null;

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-4 relative font-sans w-full py-12 md:py-20">
      <Link href="/" className="absolute top-6 left-6 text-zinc-400 hover:text-orange-500 flex items-center gap-2 font-bold uppercase tracking-wider z-20 transition-colors">
        <ArrowLeft size={20} /> Kembali
      </Link>

      <div className="max-w-md w-full bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-zinc-800 p-8 space-y-8 relative z-10 shadow-2xl mx-auto">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="SMADA50K Logo" className="h-16 w-auto drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]" />
          </div>
          <h2 className="text-xl font-black text-white tracking-widest uppercase">Login Peserta</h2>
          <p className="text-xs text-zinc-400 font-medium tracking-wide">
            Masuk untuk submit hasil lari Anda
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>
          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-wider">Email (Aktif)</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan Email Anda" 
              className="w-full px-4 py-4 bg-zinc-950 rounded-xl border border-zinc-800 text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none font-medium"
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
              className="w-full px-4 py-4 bg-zinc-950 rounded-xl border border-zinc-800 text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none font-medium"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-orange-500 text-white font-black uppercase tracking-wider py-4 rounded-xl flex justify-center items-center gap-2 hover:bg-orange-600 transition shadow-[0_0_15px_rgba(249,115,22,0.3)] mt-4 disabled:opacity-50"
          >
            {isLoading ? <><Loader2 size={20} className="animate-spin" /> Memproses...</> : <>Masuk <ArrowRight size={20} /></>}
          </button>
        </form>

        <div className="flex flex-col items-center gap-3 pt-4 border-t border-zinc-800/50">
          <div className="text-xs text-zinc-600 font-medium">
            Belum punya akun? <Link href="/register" className="text-orange-500 hover:text-white font-bold transition">Daftar sekarang</Link>
          </div>
          <div className="text-xs text-zinc-600 font-medium">
            Lupa password? <Link href="/forgot-password" className="text-orange-500 hover:text-white font-bold transition">Reset di sini</Link>
          </div>
          <Link href="/admin-login" className="text-[10px] text-zinc-600 hover:text-zinc-400 uppercase tracking-widest font-black mt-2">
            — Akses Panitia —
          </Link>
        </div>
      </div>
    </div>
  );
}
