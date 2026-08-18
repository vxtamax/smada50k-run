"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Trophy, Flame, Footprints, Timer, PlusCircle, Loader2, LogOut, Check, MapPin, Flag, CheckCircle, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const targetKm = 50;
  const [currentKm, setCurrentKm] = useState(0);
  const [paceData, setPaceData] = useState<{sesi: string, pace: number}[]>([]);
  const [sessionCount, setSessionCount] = useState(0);
  const [avgPace, setAvgPace] = useState("00:00");
  const [isLoading, setIsLoading] = useState(true);

  const [userName, setUserName] = useState("Pelari");
  const [userClass, setUserClass] = useState("Umum");
  const [submissions, setSubmissions] = useState<any[]>([]);

  // Checkpoints definition
  const checkpoints = [10, 20, 30, 40, 50];

  const fetchProgress = async () => {
    const userId = localStorage.getItem('smada_user_id');
    const name = localStorage.getItem('smada_user_name');
    const kelas = localStorage.getItem('smada_user_class');
    
    if (!userId) {
      window.location.href = '/login';
      return;
    }
    
    if (name) setUserName(name);
    if (kelas) setUserClass(kelas);
    
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }); // Urutkan dari yang terbaru

    if (data && !error) {
      setSubmissions(data);

      const validData = data.filter(d => d.status !== 'rejected');
      const total = validData.reduce((sum, row) => sum + row.distance_km, 0);
      setCurrentKm(parseFloat(total.toFixed(2)));
      setSessionCount(validData.length);

      // Balik urutan untuk grafik agar yang terlama di kiri
      const chartData = [...validData].reverse();
      
      const formattedPace = chartData.map((row, index) => {
         const [mins, secs] = row.pace_minutes.split(':').map(Number);
         const decimalPace = mins + (secs || 0) / 60;
         return {
           sesi: `Sesi ${index + 1}`,
           pace: parseFloat(decimalPace.toFixed(2))
         }
      });
      setPaceData(formattedPace);

      if (validData.length > 0) {
         const totalPaceDecimal = formattedPace.reduce((sum, d) => sum + d.pace, 0);
         const avgDecimal = totalPaceDecimal / validData.length;
         const avgMins = Math.floor(avgDecimal);
         const avgSecs = Math.round((avgDecimal - avgMins) * 60);
         setAvgPace(`${avgMins.toString().padStart(2, '0')}:${avgSecs.toString().padStart(2, '0')}`);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data lari ini?')) return;
    const toastId = toast.loading('Menghapus data...');
    try {
      const { error } = await supabase.from('submissions').delete().eq('id', id);
      if (error) throw error;
      toast.success('Data berhasil dihapus!', { id: toastId });
      fetchProgress();
    } catch (error) {
      toast.error('Gagal menghapus data.', { id: toastId });
    }
  };

  const sisaKm = Math.max(0, targetKm - currentKm);
  const isFinished = currentKm >= targetKm;
  const nextCp = checkpoints.find(cp => cp > currentKm) || targetKm;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const decimal = payload[0].value;
      const mins = Math.floor(decimal);
      const secs = Math.round((decimal - mins) * 60);
      const paceString = `${mins}:${secs.toString().padStart(2, '0')}`;
      
      return (
        <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg shadow-xl">
          <p className="text-white font-bold">{paceString} /km</p>
        </div>
      );
    }
    return null;
  };

  const donutData = [
    { name: 'Tercapai', value: currentKm, color: '#f97316' }, 
    { name: 'Sisa', value: sisaKm, color: '#27272a' }        
  ];

  if (isLoading) {
    return (
      <div className="bg-zinc-950 flex flex-col items-center justify-center text-orange-500">
        <Loader2 size={40} className="animate-spin mb-4" />
        <h2 className="font-bold tracking-widest uppercase">Memuat Data...</h2>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pb-24 font-sans selection:bg-orange-500/30 text-white w-full">
      <header className="bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="SMADA50K" className="h-8 w-auto" />
          </Link>
          
          <div className="flex items-center gap-1 sm:gap-3">
            {/* NEW MENUS */}
            <Link href="/leaderboard" className="text-zinc-400 hover:text-yellow-500 bg-zinc-900 hover:bg-yellow-500/10 border border-zinc-800 hover:border-yellow-500/30 p-2.5 rounded-xl transition" title="Klasemen">
              <Trophy size={18} />
            </Link>
            <Link href="/panduan" className="text-zinc-400 hover:text-blue-500 bg-zinc-900 hover:bg-blue-500/10 border border-zinc-800 hover:border-blue-500/30 p-2.5 rounded-xl transition" title="Panduan & Aturan">
              <BookOpen size={18} />
            </Link>
            <div className="h-6 w-px bg-zinc-800 hidden sm:block mx-2"></div>
            
            {/* USER INFO */}
            <div className="text-right hidden sm:block">
               <div className="text-sm font-bold text-zinc-300 uppercase tracking-wide">{userName}</div>
               <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{userClass}</div>
            </div>
            
            {/* SETTINGS (Profil) */}
            <Link href="/settings" className="w-10 h-10 rounded-xl bg-zinc-800 border border-orange-500/30 flex items-center justify-center text-orange-500 font-black shadow-[0_0_10px_rgba(249,115,22,0.2)] hover:bg-orange-500 hover:text-white transition-colors" title="Pengaturan Profil">
              {userName.charAt(0)}
            </Link>
            
            {/* LOGOUT */}
            <button 
               onClick={() => {
                 localStorage.clear();
                 window.location.href = '/login';
               }} 
               className="text-zinc-500 hover:text-red-500 bg-zinc-900 hover:bg-red-500/10 border border-zinc-800 hover:border-red-500/30 p-2.5 rounded-xl transition ml-1"
               title="Keluar"
            >
               <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto mt-8 px-4 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* KOLOM KIRI (Utama - Lebih Lebar) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* CHECKPOINT PROGRESS BAR SECTION */}
            <div className="bg-zinc-900 p-6 md:p-8 rounded-3xl border border-zinc-800 shadow-xl overflow-hidden">
              <div className="flex justify-between items-end mb-12">
                <div>
                  <h2 className="text-zinc-400 font-bold text-sm md:text-base uppercase tracking-widest mb-1">Total Jarak Tempuh</h2>
                  <div className="text-5xl md:text-7xl font-black text-white italic tracking-tight">
                    {currentKm} <span className="text-2xl md:text-3xl text-zinc-600 not-italic">/ 50 KM</span>
                  </div>
                </div>
                <div className="w-16 h-16 md:w-20 md:h-20 relative shrink-0">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie data={donutData} cx="50%" cy="50%" innerRadius={24} outerRadius={36} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
                         {donutData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                         ))}
                       </Pie>
                     </PieChart>
                   </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Checkpoints */}
              <div className="relative w-full px-2 md:px-6">
                {/* Background Line */}
                <div className="absolute left-4 right-4 md:left-10 md:right-10 top-1/2 -translate-y-1/2 h-2 bg-zinc-800 rounded-full z-0"></div>
                
                {/* Active Line */}
                <div 
                   className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 h-2 bg-orange-500 rounded-full z-0 transition-all duration-1000 shadow-[0_0_15px_rgba(249,115,22,0.8)]" 
                   style={{ width: `calc(${Math.min(100, (currentKm/targetKm)*100)}% - ${window?.innerWidth > 768 ? '5rem' : '2rem'})` }}
                ></div>

                {/* Checkpoint Nodes */}
                <div className="flex justify-between relative z-10">
                  {checkpoints.map((cp) => {
                    const isReached = currentKm >= cp;
                    return (
                      <div key={cp} className="flex flex-col items-center">
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-[5px] border-zinc-900 transition-colors duration-500 ${isReached ? 'bg-orange-500 text-white' : 'bg-zinc-700 text-transparent'}`}>
                          {isReached ? <Check size={16} strokeWidth={4} /> : <div className="w-2 h-2 rounded-full bg-zinc-500" />}
                        </div>
                        <div className="absolute top-10 md:top-12 w-20 text-center -ml-6 md:-ml-5">
                          <div className={`text-sm md:text-base font-black ${isReached ? 'text-orange-500' : 'text-zinc-500'}`}>{cp}K</div>
                          <div className={`text-[9px] md:text-xs font-bold uppercase tracking-wider mt-0.5 ${isReached ? 'text-green-500' : 'text-zinc-600'}`}>{isReached ? 'Tercapai' : 'Belum'}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="h-12"></div> {/* Spacer for absolute text */}
            </div>

            {/* GRAFIK PACE */}
            {paceData.length > 0 && (
              <div className="bg-zinc-900 p-6 md:p-8 rounded-3xl border border-zinc-800 shadow-xl">
                <h3 className="font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-wide text-sm md:text-base">
                  <Timer size={20} className="text-orange-500" />
                  Grafik Perkembangan Pace
                </h3>
                <div className="h-48 md:h-64 w-full -ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={paceData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                      <XAxis dataKey="sesi" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#71717a', fontWeight: 'bold'}} dy={10} />
                      <YAxis reversed={true} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#71717a', fontWeight: 'bold'}} domain={['auto', 'auto']} dx={-5} />
                      <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#3f3f46', strokeWidth: 1, strokeDasharray: '5 5' }} />
                      <Line 
                        type="monotone" 
                        dataKey="pace" 
                        stroke="#f97316" 
                        strokeWidth={4} 
                        dot={{r: 5, fill: '#18181b', stroke: '#f97316', strokeWidth: 3}} 
                        activeDot={{r: 8, fill: '#f97316', stroke: '#fff'}}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* KOLOM KANAN (Info & Stats) */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            
            {/* INFO CARDS */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex justify-between items-center relative overflow-hidden group hover:border-orange-500/30 transition-colors shadow-lg">
              <Flag className="absolute -right-4 text-zinc-800/80 group-hover:text-zinc-700 transition-colors" size={100} />
              <div className="relative z-10">
                <div className="text-xs md:text-sm text-zinc-500 font-bold uppercase tracking-widest mb-1">Sisa ke Finisher</div>
                <div className="text-4xl font-black text-white">{sisaKm.toFixed(2)} <span className="text-lg text-zinc-500">KM</span></div>
                <div className="text-xs text-zinc-400 mt-1">Menuju total 50 KM</div>
              </div>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex justify-between items-center relative overflow-hidden group hover:border-orange-500/30 transition-colors shadow-lg">
              <MapPin className="absolute -right-4 text-zinc-800/80 group-hover:text-zinc-700 transition-colors" size={100} />
              <div className="relative z-10">
                <div className="text-xs md:text-sm text-zinc-500 font-bold uppercase tracking-widest mb-1">Next Checkpoint</div>
                {isFinished ? (
                  <div className="text-3xl font-black text-green-500 flex items-center gap-2 mt-1"><CheckCircle size={28}/> Selesai</div>
                ) : (
                  <div className="text-4xl font-black text-orange-500">{nextCp} <span className="text-lg text-orange-500/50">KM</span></div>
                )}
                <div className="text-xs text-zinc-400 mt-1">{isFinished ? 'Semua checkpoint tercapai!' : `Kejar checkpoint ${nextCp}K selanjutnya`}</div>
              </div>
            </div>

            {/* STATISTIK BAWAH (Grid 2 kolom di HP, stack di Desktop) */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 mt-2">
              <div className="bg-zinc-900 p-5 md:p-6 rounded-3xl border border-zinc-800 flex flex-col gap-2 relative overflow-hidden shadow-lg">
                <Flame size={60} className="absolute -right-4 -bottom-4 text-zinc-800/50" />
                <div className="flex items-center text-orange-500 gap-2 relative z-10">
                  <span className="font-bold text-xs uppercase tracking-wider text-zinc-400">Pace Rata-rata</span>
                </div>
                <div className="text-3xl font-black text-white relative z-10">{avgPace} <span className="text-xs font-medium text-zinc-500">/km</span></div>
              </div>
              <div className="bg-zinc-900 p-5 md:p-6 rounded-3xl border border-zinc-800 flex flex-col gap-2 relative overflow-hidden shadow-lg">
                <Footprints size={60} className="absolute -right-4 -bottom-4 text-zinc-800/50" />
                <div className="flex items-center text-zinc-300 gap-2 relative z-10">
                  <span className="font-bold text-xs uppercase tracking-wider text-zinc-400">Total Sesi</span>
                </div>
                <div className="text-3xl font-black text-white relative z-10">{sessionCount} <span className="text-xs font-medium text-zinc-500">Kali Lari</span></div>
              </div>
            </div>

          </div>
        </div>
        
        {/* REKAP AKTIVITAS TABLE */}
        <div className="bg-zinc-900 p-6 md:p-8 rounded-3xl border border-zinc-800 shadow-xl overflow-hidden mt-6">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-white uppercase tracking-wide text-sm md:text-base flex items-center gap-2">
               Aktivitas Saya
             </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="text-xs md:text-xs text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="pb-3 font-bold whitespace-nowrap">Tanggal</th>
                  <th className="pb-3 font-bold">Jarak</th>
                  <th className="pb-3 font-bold hidden sm:table-cell">Durasi</th>
                  <th className="pb-3 font-bold hidden md:table-cell">Pace</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {submissions.map((sub) => {
                  const date = new Date(sub.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                  return (
                    <tr key={sub.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-4 text-white font-medium whitespace-nowrap">{date}</td>
                      <td className="py-4 font-black text-orange-500">{sub.distance_km} <span className="text-xs text-zinc-500 font-bold uppercase">km</span></td>
                      <td className="py-4 font-bold text-zinc-300 hidden sm:table-cell">{sub.duration || '—'}</td>
                      <td className="py-4 font-bold text-zinc-400 hidden md:table-cell">{sub.pace_minutes}</td>
                      <td className="py-4">
                        {sub.status === 'approved' && <span className="text-xs bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-1 rounded-md font-bold uppercase tracking-wider">Valid</span>}
                        {sub.status === 'pending' && <span className="text-xs bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-1 rounded-md font-bold uppercase tracking-wider">Pending</span>}
                        {sub.status === 'rejected' && <span className="text-xs bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-1 rounded-md font-bold uppercase tracking-wider">Ditolak</span>}
                      </td>
                      <td className="py-4 text-right flex justify-end gap-2">
                        <a href={sub.proof_link || sub.screenshot_url} target="_blank" rel="noopener noreferrer" className="text-xs md:text-xs font-bold text-zinc-400 hover:text-white border border-zinc-700 hover:border-orange-500 hover:bg-zinc-800 px-3 py-1.5 rounded-lg transition-all shadow-sm">
                          Bukti
                        </a>
                        <button onClick={() => handleDelete(sub.id)} className="text-xs md:text-xs font-bold text-red-500 hover:text-white border border-red-500/30 hover:border-red-500 hover:bg-red-500 px-3 py-1.5 rounded-lg transition-all shadow-sm">
                          Hapus
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {submissions.length === 0 && (
              <div className="text-center py-10 flex flex-col items-center justify-center">
                <span className="text-zinc-600 mb-2">🏃‍♂️</span>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Belum ada aktivitas lari</p>
              </div>
            )}
          </div>
        </div>

        {/* FLOATING UPLOAD BUTTON */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-40">
          <Link href="/submit" className="w-full bg-orange-500 text-white font-black uppercase tracking-widest py-4 md:py-5 rounded-full shadow-[0_10px_30px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2 hover:bg-orange-600 hover:scale-105 active:scale-95 transition-all">
            <PlusCircle size={22} />
            Input Hasil Lari
          </Link>
        </div>
      </main>
    </div>
  );
}
