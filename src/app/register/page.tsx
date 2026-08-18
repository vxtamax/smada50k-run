"use client";

import Link from 'next/link';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function Register() {
  const router = useRouter();
  // Event Settings State
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [registrationMessage, setRegistrationMessage] = useState('');
  const [isCheckingSettings, setIsCheckingSettings] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [kategori, setKategori] = useState('Siswa');
  const [classGroup, setClassGroup] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('smada_user_id');
    const role = localStorage.getItem('smada_user_role');
    if (userId) {
      router.replace(role === 'admin' ? '/admin' : '/dashboard');
      return;
    }

    const checkSettings = async () => {
      try {
        const { data } = await supabase.from('event_settings').select('registration_start, registration_end').eq('id', 1).single();
        if (data) {
          const now = new Date();
          const start = new Date(data.registration_start);
          const end = new Date(data.registration_end);
          
          if (now < start) {
            setIsRegistrationOpen(false);
            setRegistrationMessage('Pendaftaran Belum Dibuka');
          } else if (now > end) {
            setIsRegistrationOpen(false);
            setRegistrationMessage('Pendaftaran Telah Ditutup');
          }
        }
      } catch (e) {} finally {
        setIsCheckingSettings(false);
      }
    };
    checkSettings();
  }, []);

  // Fungsi Enkripsi Password (SHA-256)
  const hashPassword = async (text: string) => {
    const msgBuffer = new TextEncoder().encode(text + "SMADA50K_SECURE_SALT_99");
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('identifier', identifier)
        .single();

      if (existingUser) {
        toast.error("NISN / NIP tersebut sudah terdaftar! Silakan login.");
        setIsLoading(false);
        return;
      }

      const finalClassGroup = kategori === 'Guru' ? 'Guru' : classGroup;
      
      // Enkripsi password sebelum dikirim ke database
      const hashedPassword = await hashPassword(password);

      const { error } = await supabase
        .from('users')
        .insert({
          name: name,
          email: email,
          identifier: identifier,
          class_group: finalClassGroup,
          password: hashedPassword,
          role: 'user'
        });

      if (error) throw error;
      
      toast.success("Pendaftaran berhasil! Silakan Login.");
      router.push('/login');
      
    } catch (err) {
      toast.error("Gagal mendaftar. Terjadi kesalahan jaringan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-4 relative font-sans w-full py-12 md:py-20">
      <Link href="/login" className="absolute top-6 left-6 text-zinc-400 hover:text-orange-500 flex items-center gap-2 font-bold uppercase tracking-wider z-20 transition-colors">
        <ArrowLeft size={20} /> Kembali
      </Link>

      <div className="max-w-md w-full bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-zinc-800 p-8 space-y-6 relative z-10 shadow-2xl mx-auto">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="SMADA50K Logo" className="h-16 w-auto drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]" />
          </div>
          <h2 className="text-sm font-bold text-center text-zinc-500 tracking-widest uppercase mb-1">
            Pendaftaran Peserta
          </h2>
        </div>

        {isCheckingSettings ? (
          <div className="flex flex-col items-center justify-center py-10 text-orange-500">
            <Loader2 size={32} className="animate-spin mb-4" />
          </div>
        ) : !isRegistrationOpen ? (
          <div className="text-center py-10 border border-red-500/30 bg-red-500/10 rounded-2xl">
            <h3 className="text-red-500 font-black uppercase tracking-widest mb-2">{registrationMessage}</h3>
            <p className="text-sm text-zinc-400 font-medium">Mohon maaf, Anda tidak dapat mendaftar saat ini.</p>
          </div>
        ) : (
        <form className="space-y-4" onSubmit={handleRegister}>
          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-wider">Nama Lengkap</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Cth: Budi Santoso" 
              className="w-full px-4 py-3.5 bg-zinc-950 rounded-xl border border-zinc-800 text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none font-medium text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-wider">Email (Aktif)</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Cth: budi@gmail.com" 
              className="w-full px-4 py-3.5 bg-zinc-950 rounded-xl border border-zinc-800 text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none font-medium text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-wider">NISN (Siswa) / NIP (Guru)</label>
            <input 
              type="text" 
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Masukkan identitas resmi..." 
              className="w-full px-4 py-3.5 bg-zinc-950 rounded-xl border border-zinc-800 text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none font-medium text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-wider">Kategori Peserta</label>
            <select 
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full px-4 py-3.5 bg-zinc-950 rounded-xl border border-zinc-800 text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none font-medium text-sm cursor-pointer"
            >
              <option value="Siswa">Siswa SMADA</option>
              <option value="Guru">Guru / Staf SMADA</option>
            </select>
          </div>

          {kategori === 'Siswa' && (
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-wider">Kelas (Wajib Diisi)</label>
              <input 
                type="text" 
                value={classGroup}
                onChange={(e) => setClassGroup(e.target.value)}
                placeholder="Cth: X MIPA 1" 
                className="w-full px-4 py-3.5 bg-zinc-950 rounded-xl border border-zinc-800 text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none font-medium text-sm"
                required={kategori === 'Siswa'}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-wider">Buat Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full px-4 py-3.5 bg-zinc-950 rounded-xl border border-zinc-800 text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none font-medium text-sm"
              required
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-orange-500 text-white font-black uppercase tracking-wider py-4 rounded-xl flex justify-center items-center gap-2 hover:bg-orange-600 transition shadow-[0_0_15px_rgba(249,115,22,0.3)] mt-2 disabled:opacity-50"
          >
            {isLoading ? <><Loader2 size={18} className="animate-spin" /> Mendaftarkan...</> : <>Daftar Sekarang <ArrowRight size={18} /></>}
          </button>
        </form>
        )}

        <div className="text-center text-sm text-zinc-400 font-medium pt-2 border-t border-zinc-800/50">
          Sudah punya akun? <Link href="/login" className="text-orange-500 hover:text-white font-bold transition">Login di sini</Link>
        </div>
      </div>
    </div>
  );
}
