"use client";

import Link from 'next/link';
import { ArrowRight, ArrowLeft, Loader2, KeyRound } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem('smada_user_id');
    const role = localStorage.getItem('smada_user_role');
    if (userId) {
      router.replace(role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [router]);
  
  // State step 1 (Verifikasi)
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [verifiedId, setVerifiedId] = useState<string | null>(null);
  
  // State step 2 (Reset)
  const [newPassword, setNewPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  // Fungsi Enkripsi Password (SHA-256)
  const hashPassword = async (text: string) => {
    const msgBuffer = new TextEncoder().encode(text + "SMADA50K_SECURE_SALT_99");
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('identifier', identifier)
        .eq('email', email)
        .single();
        
      if (error || !data) {
        toast.error("NISN atau Email tidak ditemukan di sistem!");
      } else {
        toast.success("Data ditemukan! Silakan buat password baru.");
        setVerifiedId(data.id);
      }
    } catch (err) {
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedId) return;
    
    setIsLoading(true);
    
    try {
      const hashedPassword = await hashPassword(newPassword);
      
      const { error } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', verifiedId);
        
      if (error) throw error;
      
      toast.success("Password berhasil direset! Silakan login.");
      router.push('/login');
    } catch (err) {
      toast.error("Gagal mereset password.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-4 relative font-sans w-full py-12 md:py-20">
      <Link href="/login" className="absolute top-6 left-6 text-zinc-400 hover:text-orange-500 flex items-center gap-2 font-bold uppercase tracking-wider z-20 transition-colors">
        <ArrowLeft size={20} /> Kembali
      </Link>

      <div className="max-w-md w-full bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-zinc-800 p-8 space-y-8 relative z-10 shadow-2xl mx-auto">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6 text-orange-500">
             <KeyRound size={48} strokeWidth={1.5} className="drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]" />
          </div>
        
          <h2 className="text-sm font-bold text-center text-zinc-400 tracking-widest uppercase mb-1">
            Lupa Password
          </h2>
          <p className="text-xs text-zinc-500 font-medium">
            {!verifiedId ? "Masukkan NISN/NIP dan Email yang terdaftar untuk verifikasi keamanan." : "Silakan masukkan password baru Anda."}
          </p>
        </div>

        {!verifiedId ? (
          <form className="space-y-5" onSubmit={handleVerify}>
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-wider">NISN / NIP</label>
              <input 
                type="text" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Masukkan NISN / NIP" 
                className="w-full px-4 py-4 bg-zinc-950 rounded-xl border border-zinc-800 text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none font-medium"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-wider">Email Terdaftar</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Cth: budi@gmail.com" 
                className="w-full px-4 py-4 bg-zinc-950 rounded-xl border border-zinc-800 text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none font-medium"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-zinc-800 hover:bg-orange-500 text-white font-black uppercase tracking-wider py-4 rounded-xl flex justify-center items-center gap-2 transition-all border border-zinc-700 hover:border-orange-500 mt-4 disabled:opacity-50"
            >
              {isLoading ? <><Loader2 size={20} className="animate-spin" /> Memeriksa...</> : <>Verifikasi Data</>}
            </button>
          </form>
        ) : (
          <form className="space-y-5 animate-in fade-in duration-300" onSubmit={handleReset}>
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-wider">Password Baru</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter" 
                minLength={6}
                className="w-full px-4 py-4 bg-zinc-950 rounded-xl border border-zinc-800 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none font-medium"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-green-500 text-white font-black uppercase tracking-wider py-4 rounded-xl flex justify-center items-center gap-2 hover:bg-green-600 transition shadow-[0_0_15px_rgba(34,197,94,0.3)] mt-4 disabled:opacity-50"
            >
              {isLoading ? <><Loader2 size={20} className="animate-spin" /> Menyimpan...</> : <>Simpan Password <ArrowRight size={20} /></>}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
