"use client";

import Link from 'next/link';
import { ArrowLeft, BookOpen, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function RulesPage() {
  const [backUrl, setBackUrl] = useState('/');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('smada_user_id');
      setBackUrl(userId ? '/dashboard' : '/');
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col font-sans w-full py-10 px-4 max-w-4xl mx-auto text-white">
      <Link href={backUrl} className="text-zinc-400 hover:text-orange-500 flex items-center gap-2 font-bold uppercase tracking-wider mb-8 w-fit transition-colors">
        <ArrowLeft size={20} /> Kembali
      </Link>

      <div className="text-center mb-10">
         <BookOpen size={56} className="text-orange-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]" />
         <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
           PANDUAN & ATURAN
         </h1>
         <p className="text-zinc-500 font-bold uppercase tracking-widest mt-2 text-sm">SMADA50K Virtual Run & Walk</p>
      </div>

      <div className="space-y-6">
        <div className="bg-zinc-900/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-zinc-800 shadow-xl">
          <h2 className="flex items-center gap-3 text-xl font-black text-orange-500 uppercase tracking-wider mb-4 border-b border-zinc-800 pb-4">
            <CheckCircle2 size={24} /> Aturan Dasar
          </h2>
          <ul className="space-y-4 text-zinc-300 font-medium leading-relaxed">
            <li className="flex gap-3">
              <span className="text-orange-500 font-black">1.</span> 
              <span>Tantangan ini bersifat akumulatif. Anda bebas menyicil jarak tempuh 50 KM dalam beberapa sesi lari/jalan kaki kapan saja selama periode acara berlangsung.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-orange-500 font-black">2.</span> 
              <span>Aktivitas yang sah hanyalah <b>Berlari (Run)</b> dan <b>Berjalan Kaki (Walk)</b>. Aktivitas bersepeda, bermotor, atau naik kendaraan umum tidak akan dihitung dan akan ditolak oleh Panitia.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-orange-500 font-black">3.</span> 
              <span>Jarak minimum per sesi yang dapat diinput adalah <b>1 KM</b>.</span>
            </li>
          </ul>
        </div>

        <div className="bg-zinc-900/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-zinc-800 shadow-xl">
          <h2 className="flex items-center gap-3 text-xl font-black text-orange-500 uppercase tracking-wider mb-4 border-b border-zinc-800 pb-4">
            <ShieldCheck size={24} /> Pelaporan & Bukti (Tracking)
          </h2>
          <ul className="space-y-4 text-zinc-300 font-medium leading-relaxed">
            <li className="flex gap-3">
              <span className="text-orange-500 font-black">1.</span> 
              <span>Peserta wajib merekam aktivitas menggunakan aplikasi GPS Tracking seperti <b>Strava, Garmin, Relive, Suunto, Coros</b>, atau aplikasi serupa lainnya.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-orange-500 font-black">2.</span> 
              <span>Saat melakukan pelaporan (Submit) di aplikasi ini, peserta <b>wajib menyertakan Link (URL) publik</b> dari aktivitas tersebut agar Panitia dapat memverifikasi keaslian rute, jarak, dan pace.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-orange-500 font-black">3.</span> 
              <span>Pastikan pengaturan privasi (Privacy) di aplikasi pelacak Anda (misal: Strava) diatur menjadi <b>Publik (Everyone)</b> agar panitia dapat membuka link tersebut tanpa harus mengikuti (*follow*) akun Anda.</span>
            </li>
          </ul>
        </div>

        <div className="bg-orange-500/10 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-orange-500/30 shadow-xl">
          <h2 className="flex items-center gap-3 text-xl font-black text-orange-500 uppercase tracking-wider mb-4 border-b border-orange-500/20 pb-4">
            <AlertTriangle size={24} /> Kebijakan Kejujuran (Fair Play)
          </h2>
          <p className="text-orange-200 font-medium leading-relaxed">
            Acara ini mengedepankan semangat sportivitas dan kejujuran. Panitia SMADA50K memiliki wewenang penuh untuk <b>menolak (Reject)</b> laporan aktivitas yang terindikasi curang (misal: pace tidak masuk akal, grafik jantung/elevasi menunjukkan pola kendaraan bermotor, atau GPS error secara ekstrem).
          </p>
          <p className="text-orange-200 font-medium leading-relaxed mt-4 italic">
            "Berlarilah untuk kesehatanmu sendiri, karena medali terbesar adalah kejujuran pada dirimu sendiri."
          </p>
        </div>
      </div>
    </div>
  );
}
