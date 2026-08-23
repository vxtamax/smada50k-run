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
              <span>Tantangan ini bersifat akumulatif. Anda bebas menyicil jarak tempuh 50 KM dalam beberapa sesi lari atau jalan kaki kapan saja selama periode acara berlangsung.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-orange-500 font-black">2.</span> 
              <span>Aktivitas yang sah hanyalah <b>Berlari (Run)</b> dan <b>Berjalan Kaki (Walk)</b>. Aktivitas menggunakan sepeda, kendaraan bermotor, atau transportasi umum akan langsung ditolak oleh sistem.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-orange-500 font-black">3.</span> 
              <span>Jarak minimum per sesi yang dapat dilaporkan adalah <b>1 KM</b>.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-orange-500 font-black">4.</span> 
              <span>Selesaikan misi 50 KM Anda dan bersiaplah untuk mengklaim <b>E-Certificate eksklusif</b> yang bisa diunduh langsung dari Dashboard segera setelah rangkaian acara resmi ditutup.</span>
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
              <span>Rekam setiap aktivitas Anda menggunakan aplikasi GPS Tracking andalan seperti <b>Strava, Garmin, Relive, Suunto, Coros</b>, atau aplikasi pelacak presisi lainnya.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-orange-500 font-black">2.</span> 
              <span>Saat melapor di web ini, Anda <b>wajib melampirkan Link Publik (URL)</b> dari aktivitas Anda. Pastikan pengaturan privasi di aplikasi Anda diatur ke mode <b>Publik (Everyone)</b>. Laporan dengan tautan yang terkunci (Private) akan otomatis ditolak karena tidak dapat diverifikasi oleh panitia.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-orange-500 font-black">3.</span> 
              <span>Tidak perlu panik jika Anda salah ketik atau salah memasukkan jarak. Selama laporan Anda masih bersatus <b>Pending</b>, Anda memiliki kendali penuh untuk <b>menghapus dan memperbaikinya</b> langsung dari menu Dashboard.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-orange-500 font-black">4.</span> 
              <span>Sebagai langkah keamanan ekstra untuk melindungi data pelari, sistem kami akan secara otomatis mengeluarkan (logout) akun Anda jika tidak ada aktivitas di dalam web selama lebih dari 30 menit.</span>
            </li>
          </ul>
        </div>

        <div className="bg-orange-500/10 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-orange-500/30 shadow-xl">
          <h2 className="flex items-center gap-3 text-xl font-black text-orange-500 uppercase tracking-wider mb-4 border-b border-orange-500/20 pb-4">
            <AlertTriangle size={24} /> Kebijakan Kejujuran (Fair Play)
          </h2>
          <p className="text-orange-200 font-medium leading-relaxed">
            Acara ini dibangun di atas semangat sportivitas dan kejujuran tanpa kompromi. Panitia SMADA50K memiliki wewenang penuh untuk menolak laporan yang terindikasi curang, seperti catatan waktu (pace) yang tidak masuk akal atau grafik pergerakan yang menyerupai kendaraan bermotor.
          </p>
          <p className="text-orange-200 font-medium leading-relaxed mt-4">
            Selain itu, sistem keamanan kami telah dilengkapi dengan pelacak pintar yang akan mendeteksi penggunaan tautan (link) ganda. Penggunaan satu link Strava yang sama secara berulang akan langsung tertangkap oleh radar sistem.
          </p>
          <p className="text-orange-200 font-black leading-relaxed mt-6 italic">
            "Berlarilah untuk kesehatan dan kebanggaan Anda sendiri. Medali dan sertifikat terbesar adalah kejujuran yang Anda pegang hingga garis akhir."
          </p>
        </div>
      </div>
    </div>
  );
}
