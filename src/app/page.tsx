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
      <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center gap-6 z-50">
        <div className="flex items-center gap-4">
          <a href="https://www.instagram.com/andredwad/" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-pink-500 transition-colors" title="Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
          <a href="https://github.com/vxtamax" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors" title="GitHub">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-8.3a5.9 5.9 0 0 0-1.9-4.3 5.8 5.8 0 0 0-.2-4.2s-1.4-.5-4.5 2.1a15.2 15.2 0 0 0-8 0C3.4 1.7 2 2.2 2 2.2a5.8 5.8 0 0 0-.2 4.2 5.9 5.9 0 0 0-1.9 4.3c0 6.8 3 8 6 8.3a4.8 4.8 0 0 0-1 3.2v4"></path>
            </svg>
          </a>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/leaderboard" className="flex items-center gap-2 text-xs md:text-sm font-bold text-zinc-400 hover:text-yellow-500 uppercase tracking-widest transition-colors">
            <Trophy size={16} /> Klasemen
          </Link>
          <Link href="/panduan" className="flex items-center gap-2 text-xs md:text-sm font-bold text-zinc-400 hover:text-blue-500 uppercase tracking-widest transition-colors">
            <BookOpen size={16} /> Panduan
          </Link>
        </div>
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

        {/* PORTFOLIO BADGE */}
        <div className="pt-16 pb-4">
          <a 
            href="https://portolio-vxtamax.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-full text-xs font-bold text-zinc-400 hover:text-orange-500 hover:border-orange-500/50 transition-all group shadow-lg"
          >
            <span>Developed by</span>
            <span className="text-white group-hover:text-orange-500 transition-colors">Vxtamax</span>
            <span className="relative flex h-2 w-2 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
