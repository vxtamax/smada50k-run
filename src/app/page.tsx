"use client";

import Link from 'next/link';
import { ArrowRight, Trophy, BookOpen, Clock, Activity, Target } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
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

  if (isChecking) return null; // Prevent flicker before redirect

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative font-sans w-full py-12 md:py-20">
      
      {/* HEADER POJOK KANAN ATAS */}
      <header className="absolute top-0 left-0 w-full p-6 flex justify-end gap-6 z-50">
        <Link href="/leaderboard" className="flex items-center gap-2 text-xs md:text-sm font-bold text-zinc-400 hover:text-yellow-500 uppercase tracking-widest transition-colors">
          <Trophy size={16} /> Klasemen
        </Link>
        <Link href="/panduan" className="flex items-center gap-2 text-xs md:text-sm font-bold text-zinc-400 hover:text-blue-500 uppercase tracking-widest transition-colors">
          <BookOpen size={16} /> Panduan
        </Link>
      </header>

      <div className="text-center space-y-6 max-w-3xl px-4 relative z-10 mx-auto">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="SMADA50K Logo" className="h-24 md:h-32 w-auto drop-shadow-[0_0_20px_rgba(249,115,22,0.4)]" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
          VIRTUAL RUN & WALK
        </h1>
        
        <div className="bg-orange-500/10 border border-orange-500/30 text-orange-500 font-bold uppercase tracking-widest text-xs md:text-sm py-2 px-6 rounded-full inline-block mx-auto mb-2 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
          Road to 50th Anniversary SMAN 2 Lumajang
        </div>

        <p className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto font-medium">
          Tantang dirimu menempuh jarak <span className="text-white font-bold">50 Kilometer!</span> Bebas mau lari atau jalan kaki, kapan pun dan di mana pun. Yuk, cicil jaraknya dari sekarang dan pantau terus progresmu sampai garis finish!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-5 justify-center pt-8">
          <Link href="/login" className="px-8 py-4 bg-orange-500 text-white font-black text-lg uppercase tracking-wider hover:bg-orange-600 transition shadow-[0_0_20px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2 rounded-lg transform hover:-translate-y-1">
            Mulai Sekarang <ArrowRight size={24} />
          </Link>
          <Link href="/admin-login" className="px-8 py-4 bg-zinc-900 border-2 border-zinc-700 text-zinc-300 font-bold text-lg uppercase tracking-wider hover:border-orange-500 hover:text-orange-500 transition flex items-center justify-center rounded-lg">
            Panel Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
