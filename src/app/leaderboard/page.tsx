"use client";

import Link from 'next/link';
import { Trophy, ArrowLeft, Loader2, Medal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [backUrl, setBackUrl] = useState('/');

  useEffect(() => {
    // Cek apakah user sudah login atau belum untuk tombol "Kembali"
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('smada_user_id');
      setBackUrl(userId ? '/dashboard' : '/');
    }

    const fetchLeaderboard = async () => {
      try {
        const { data: approvedData } = await supabase
          .from('submissions')
          .select(`distance_km, users ( id, name, class_group )`)
          .eq('status', 'approved');

        if (approvedData) {
          const userTotals: Record<string, {name: string, kelas: string, totalKm: number}> = {};
          
          approvedData.forEach(sub => {
            const user = sub.users as any;
            if (!user) return;
            if (!userTotals[user.id]) {
              userTotals[user.id] = { name: user.name, kelas: user.class_group, totalKm: 0 };
            }
            userTotals[user.id].totalKm += sub.distance_km;
          });

          const sorted = Object.values(userTotals)
            .sort((a, b) => b.totalKm - a.totalKm)
            .map((u, index) => ({
              rank: index + 1,
              name: u.name,
              kelas: u.kelas,
              totalKm: parseFloat(u.totalKm.toFixed(2))
            }))
            .slice(0, 50); // Menampilkan Top 50

          setLeaderboard(sorted);
        }
      } catch (err) {
        console.error("Gagal memuat leaderboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="flex-1 flex flex-col font-sans w-full py-10 px-4 max-w-4xl mx-auto">
      <Link href={backUrl} className="text-zinc-400 hover:text-orange-500 flex items-center gap-2 font-bold uppercase tracking-wider mb-8 w-fit transition-colors">
        <ArrowLeft size={20} /> Kembali
      </Link>

      <div className="text-center mb-10">
         <Trophy size={56} className="text-yellow-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]" />
         <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
           KLASEMEN <span className="text-orange-500">SMADA50K</span>
         </h1>
         <p className="text-zinc-500 font-bold uppercase tracking-widest mt-2 text-sm">Top 50 Pelari Terjauh</p>
      </div>

      <div className="bg-zinc-900/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-orange-500">
             <Loader2 size={40} className="animate-spin mb-4" />
             <h2 className="font-bold tracking-widest uppercase">Memuat Data...</h2>
          </div>
        ) : (
          <div className="space-y-4 relative z-10">
            {leaderboard.map((user) => (
              <div key={user.rank} className="flex items-center gap-4 bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800/80 hover:border-orange-500/50 transition-all hover:scale-[1.02]">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-2xl shrink-0
                  ${user.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-[0_0_15px_rgba(250,204,21,0.4)] border border-yellow-300/50' : 
                    user.rank === 2 ? 'bg-gradient-to-br from-zinc-300 to-zinc-500 border border-zinc-300/50' : 
                    user.rank === 3 ? 'bg-gradient-to-br from-orange-700 to-amber-900 border border-orange-500/30' : 
                    'bg-zinc-800 border border-zinc-700 text-zinc-500'}`}>
                  {user.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-white text-lg truncate">{user.name}</div>
                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">{user.kelas}</div>
                </div>
                <div className="font-black text-orange-500 text-3xl text-right shrink-0">
                  {user.totalKm} <span className="text-xs text-zinc-500 block -mt-1 uppercase tracking-widest">KM</span>
                </div>
              </div>
            ))}
            
            {leaderboard.length === 0 && (
              <div className="text-center text-zinc-500 font-bold text-sm py-16 flex flex-col items-center gap-3">
                 <Medal size={48} className="text-zinc-700" />
                 Belum ada pelari yang diverifikasi.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
