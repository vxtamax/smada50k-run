"use client";

import Link from 'next/link';
import { ArrowLeft, UploadCloud, CheckCircle, Loader2, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function SubmitRun() {
  const router = useRouter();
  
  // Settings State
  const [isRunOpen, setIsRunOpen] = useState(true);
  const [runMessage, setRunMessage] = useState('');
  const [isCheckingSettings, setIsCheckingSettings] = useState(true);

  // Form State
  const [date, setDate] = useState('');
  const [type, setType] = useState('Lari');
  const [distance, setDistance] = useState('');
  const [jam, setJam] = useState('');
  const [menit, setMenit] = useState('');
  const [detik, setDetik] = useState('');
  const [source, setSource] = useState('Strava');
  const [proof, setProof] = useState('');
  
  const [calculatedPace, setCalculatedPace] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkSettings = async () => {
      try {
        const { data } = await supabase.from('event_settings').select('run_start, run_end').eq('id', 1).single();
        if (data) {
          const now = new Date();
          const start = new Date(data.run_start);
          const end = new Date(data.run_end);
          
          if (now < start) {
            setIsRunOpen(false);
            setRunMessage('Periode Submit Belum Dibuka');
          } else if (now > end) {
            setIsRunOpen(false);
            setRunMessage('Periode Submit Telah Ditutup');
          }
        }
      } catch (e) {} finally {
        setIsCheckingSettings(false);
      }
    };
    checkSettings();
  }, []);
  
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [jenis, setJenis] = useState('Lari');
  const [sumber, setSumber] = useState('');
  const [link, setLink] = useState('');
  
  const [durasi, setDurasi] = useState('');
  
  const [pace, setPace] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    const editDataStr = localStorage.getItem('edit_submission');
    if (editDataStr) {
      try {
        const editData = JSON.parse(editDataStr);
        setEditId(editData.id);
        setDistance(editData.distance_km.toString());
        setTanggal(editData.activity_date || new Date().toISOString().split('T')[0]);
        setJenis(editData.activity_type || 'Lari');
        setLink(editData.proof_link || editData.screenshot_url);
        setSumber(editData.tracking_source || 'Strava');
        
        if (editData.duration) {
          const parts = editData.duration.split(':');
          if (parts.length === 3) {
            setJam(parts[0]);
            setMenit(parts[1]);
            setDetik(parts[2]);
          } else if (parts.length === 2) {
            setMenit(parts[0]);
            setDetik(parts[1]);
          }
        }
        localStorage.removeItem('edit_submission');
      } catch (e) {
        console.error("Gagal load edit data", e);
      }
    }
  }, []);

  useEffect(() => {
    if (jam || menit || detik) {
       const j = (jam || '00').padStart(2, '0');
       const m = (menit || '00').padStart(2, '0');
       const d = (detik || '00').padStart(2, '0');
       setDurasi(`${j}:${m}:${d}`);
    } else {
       setDurasi('');
    }
  }, [jam, menit, detik]);

  useEffect(() => {
    if (distance && durasi && durasi !== '00:00:00') {
      const parts = durasi.split(':');
      if (parts.length === 3 || parts.length === 2) {
         let h = 0, m = 0, s = 0;
         if (parts.length === 3) {
           h = parseInt(parts[0]) || 0;
           m = parseInt(parts[1]) || 0;
           s = parseInt(parts[2]) || 0;
         } else {
           m = parseInt(parts[0]) || 0;
           s = parseInt(parts[1]) || 0;
         }
         
         const totalMinutes = (h * 60) + m + (s / 60);
         const dist = parseFloat(distance);
         
         if (dist > 0 && totalMinutes > 0) {
            const rawPace = totalMinutes / dist;
            const paceMins = Math.floor(rawPace);
            const paceSecs = Math.round((rawPace - paceMins) * 60);
            setPace(`${paceMins.toString().padStart(2, '0')}:${paceSecs.toString().padStart(2, '0')}`);
         } else {
            setPace('');
         }
      }
    } else {
      setPace('');
    }
  }, [distance, durasi]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!link || !distance || !pace || !sumber) {
       toast.error("Mohon lengkapi semua data wajib!");
       return;
    }

    const userId = localStorage.getItem('smada_user_id');
    if (!userId) {
       toast.error("Sesi Anda telah habis. Silakan login kembali.");
       router.push('/login');
       return;
    }

    setIsSubmitting(true);
    
    try {
      const payload = {
        distance_km: parseFloat(distance),
        pace_minutes: pace,
        activity_date: tanggal,
        activity_type: jenis,
        duration: durasi,
        tracking_source: sumber,
        proof_link: link,
        screenshot_url: link
      };

      if (editId) {
        const { error: dbError } = await supabase
          .from('submissions')
          .update(payload)
          .eq('id', editId);
        
        if (dbError) throw dbError;
        toast.success("Horee! Laporan berhasil diperbarui!");
      } else {
        const { error: dbError } = await supabase
          .from('submissions')
          .insert({
            ...payload,
            user_id: userId
          });
          
        if (dbError) throw dbError;
        toast.success("Horee! Laporan berhasil dikirim ke Admin!");
      }

      router.push('/dashboard');
      
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(`Gagal mengirim data. Pastikan format sudah benar.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-10 font-sans text-white selection:bg-orange-500/30 w-full">
       <header className="bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center gap-4 p-4">
          <Link href="/dashboard" className="text-zinc-400 hover:text-orange-500 bg-zinc-800 hover:bg-orange-500/10 border border-zinc-700 hover:border-orange-500/30 p-2 rounded-xl transition">
            <ArrowLeft size={20} />
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="SMADA50K" className="h-6 w-auto" />
          </Link>
          <div className="ml-auto text-xs font-bold text-zinc-500 uppercase tracking-widest bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700">Input Hasil</div>
        </div>
      </header>

       <div className="max-w-2xl mx-auto p-4 mt-4">
         <div className="bg-zinc-900 p-6 md:p-8 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
               <UploadCloud size={150} />
            </div>

            {isCheckingSettings ? (
              <div className="flex flex-col items-center justify-center py-20 text-orange-500 relative z-10">
                <Loader2 size={32} className="animate-spin mb-4" />
                <p className="font-bold tracking-widest uppercase text-sm">Memeriksa Jadwal...</p>
              </div>
            ) : !isRunOpen ? (
              <div className="text-center py-20 border border-red-500/30 bg-red-500/10 rounded-2xl relative z-10">
                <h3 className="text-red-500 font-black uppercase tracking-widest mb-2 text-xl">{runMessage}</h3>
                <p className="text-sm text-zinc-400 font-medium">Laporan hanya dapat dikirim selama periode acara berlangsung.</p>
              </div>
            ) : (
            <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider">Tanggal Aktivitas</label>
                    <input 
                      type="date" 
                      value={tanggal}
                      onChange={(e) => setTanggal(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-white font-bold text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none [color-scheme:dark]" 
                      required
                    />
                 </div>
                 
                 <div className="space-y-2">
                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider">Jenis Aktivitas</label>
                    <select 
                      value={jenis}
                      onChange={(e) => setJenis(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-white font-bold text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none cursor-pointer appearance-none" 
                    >
                      <option value="Lari">Lari (Run)</option>
                      <option value="Jalan">Jalan (Walk)</option>
                    </select>
                 </div>
               </div>

               <hr className="border-zinc-800/50" />

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider">Jarak (KM)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-orange-500 font-black text-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none placeholder:text-zinc-700" 
                      placeholder="Cth: 5.2" 
                      required
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider">Durasi (Jam : Menit : Detik)</label>
                    <div className="flex gap-2 items-center">
                       <input 
                         type="number" 
                         min="0" max="99" 
                         value={jam} 
                         onChange={e => setJam(e.target.value)} 
                         placeholder="00" 
                         className="w-1/3 bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-center text-white font-bold text-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none" 
                       />
                       <span className="text-zinc-600 font-black">:</span>
                       <input 
                         type="number" 
                         min="0" max="59" 
                         value={menit} 
                         onChange={e => setMenit(e.target.value)} 
                         placeholder="00" 
                         className="w-1/3 bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-center text-white font-bold text-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none" 
                       />
                       <span className="text-zinc-600 font-black">:</span>
                       <input 
                         type="number" 
                         min="0" max="59" 
                         value={detik} 
                         onChange={e => setDetik(e.target.value)} 
                         placeholder="00" 
                         className="w-1/3 bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-center text-white font-bold text-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none" 
                       />
                    </div>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black text-zinc-500 uppercase tracking-wider">Pace <span className="bg-zinc-800 text-[8px] px-1.5 py-0.5 rounded text-zinc-400">Otomatis</span></label>
                    <input 
                      type="text" 
                      value={pace || '—'}
                      readOnly
                      className="w-full bg-zinc-950/50 border border-zinc-800/50 rounded-xl p-3.5 text-zinc-500 font-bold text-sm outline-none cursor-not-allowed" 
                    />
                 </div>
                 
                 <div className="space-y-2">
                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider">Sumber Tracking</label>
                    <select 
                      value={sumber}
                      onChange={(e) => setSumber(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-white font-bold text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none cursor-pointer appearance-none" 
                      required
                    >
                      <option value="" disabled>Pilih sumber...</option>
                      <option value="Strava">Strava</option>
                      <option value="Garmin">Garmin</option>
                      <option value="Coros">Coros</option>
                      <option value="Suunto">Suunto</option>
                      <option value="Relive">Relive</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                 </div>
               </div>

               <div className="space-y-2 pt-2">
                  <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">Link Bukti Aktivitas</label>
                  <div className="bg-orange-500/10 border border-orange-500/30 p-3 rounded-xl flex gap-3 items-start mb-4">
                    <Info size={16} className="text-orange-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                      Pastikan link bersifat publik (bisa diakses admin). Contoh: <span className="text-white">https://strava.app.link/...</span>
                    </p>
                  </div>

                  <input 
                    type="url" 
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-white font-medium text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none placeholder:text-zinc-700" 
                    placeholder="Masukkan URL / Link bukti lari di sini..." 
                    required
                  />
               </div>
               
               <button 
                 type="submit" 
                 disabled={!link || !distance || !pace || !sumber || !durasi || isSubmitting}
                 className="w-full bg-orange-500 text-white font-black uppercase tracking-widest py-4 rounded-xl mt-8 shadow-[0_5px_20px_rgba(249,115,22,0.3)] hover:bg-orange-600 disabled:opacity-50 disabled:shadow-none disabled:hover:bg-orange-500 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2"
               >
                  {isSubmitting ? (
                    <><Loader2 size={18} className="animate-spin" /> MENGIRIM...</>
                  ) : editId ? (
                    'PERBARUI DATA LARI'
                  ) : (
                    'KIRIM DATA LARI'
                  )}
               </button>
            </form>
            )}
         </div>
       </div>
    </div>
  )
}
