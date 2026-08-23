"use client";

import Link from 'next/link';
import { Check, X, Eye, Trophy, Clock, LogOut, Loader2, Flame, ExternalLink, Search, Settings, Mail, Copy, Lock, Users, Trash2, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'verifikasi' | 'peserta' | 'pengaturan' | 'email' | 'riwayat'>('verifikasi');
  
  // Data State
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isBulkApproving, setIsBulkApproving] = useState(false);
  const [historySubmissions, setHistorySubmissions] = useState<any[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<any[]>([]);

  
  // Settings State
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [settings, setSettings] = useState<any>({
    registration_start: '',
    registration_end: '',
    run_start: '',
    run_end: ''
  });
  
  // Email Blast State
  const [allEmails, setAllEmails] = useState<string[]>([]);

  const getPaceStatus = (paceString: string) => {
    if (!paceString) return { color: 'text-zinc-500', bg: 'bg-zinc-800', label: 'NORMAL' };
    const parts = paceString.split(':');
    if (parts.length < 2) return { color: 'text-zinc-500', bg: 'bg-zinc-800', label: 'NORMAL' };
    const mins = parseInt(parts[0]);
    if (mins < 3) return { color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/30', label: 'TIDAK MASUK AKAL' };
    if (mins < 5) return { color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/30', label: 'SANGAT CEPAT' };
    if (mins > 30) return { color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/30', label: 'TERLALU LAMBAT' };
    return { color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/30', label: 'WAJAR' };
  };

  const formatForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  };

  const handleBulkApproveWajar = async () => {
    const wajarSubmissions = pendingSubmissions.filter(sub => {
      const paceStatus = getPaceStatus(sub.pace_minutes);
      return paceStatus.label === 'WAJAR';
    });

    if (wajarSubmissions.length === 0) {
      toast.error('Tidak ada laporan berstatus WAJAR (Hijau) saat ini.');
      return;
    }

    if (!window.confirm(`Anda akan MENERIMA ${wajarSubmissions.length} laporan Wajar sekaligus. Anda yakin?`)) return;

    setIsBulkApproving(true);
    const toastId = toast.loading(`Memproses ${wajarSubmissions.length} data...`);

    try {
      const idsToApprove = wajarSubmissions.map(s => s.id);
      
      const { error } = await supabase
        .from('submissions')
        .update({ status: 'approved' })
        .in('id', idsToApprove);

      if (error) throw error;

      toast.success(`${wajarSubmissions.length} laporan berhasil disetujui!`, { id: toastId });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Gagal melakukan aksi massal.', { id: toastId });
    } finally {
      setIsBulkApproving(false);
    }
  };

  const fetchData = async () => {
    const userId = localStorage.getItem('smada_user_id');
    if (!userId) {
      router.push('/login');
      return;
    }

    const { data: userDb } = await supabase.from('users').select('role').eq('id', userId).single();
    if (!userDb || userDb.role !== 'admin') {
      toast.error("Akses ditolak. Anda bukan Admin.");
      router.push('/dashboard');
      return;
    }

    try {
      // 1. Fetch Verifikasi
      const { data: pendingData } = await supabase
        .from('submissions')
        .select(`id, distance_km, pace_minutes, screenshot_url, proof_link, duration, created_at, users ( name, class_group )`)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });
      if (pendingData) setPendingSubmissions(pendingData);

      // 2. Fetch Leaderboard
      const { data: approvedData } = await supabase.from('submissions').select(`distance_km, pace_minutes, users ( id, name, class_group )`).eq('status', 'approved');
      if (approvedData) {
        const userTotals: Record<string, {name: string, kelas: string, totalKm: number, totalPaceDecimal: number, sessionCount: number}> = {};
        
        approvedData.forEach(sub => {
          const user = sub.users as any;
          if (!user) return;
          if (!userTotals[user.id]) userTotals[user.id] = { name: user.name, kelas: user.class_group, totalKm: 0, totalPaceDecimal: 0, sessionCount: 0 };
          userTotals[user.id].totalKm += sub.distance_km;
          
          if (sub.pace_minutes) {
            const [mins, secs] = sub.pace_minutes.split(':').map(Number);
            const decimalPace = mins + (secs || 0) / 60;
            userTotals[user.id].totalPaceDecimal += decimalPace;
          }
          userTotals[user.id].sessionCount += 1;
        });
        
        const sorted = Object.values(userTotals)
          .map(u => {
            const avgDecimal = u.sessionCount > 0 ? u.totalPaceDecimal / u.sessionCount : 0;
            return {
              name: u.name,
              kelas: u.kelas,
              totalKm: parseFloat(u.totalKm.toFixed(2)),
              avgPaceDecimal: avgDecimal
            };
          })
          .sort((a, b) => {
            if (b.totalKm !== a.totalKm) return b.totalKm - a.totalKm;
            return a.avgPaceDecimal - b.avgPaceDecimal;
          })
          .map((u, index) => ({ rank: index + 1, name: u.name, kelas: u.kelas, totalKm: u.totalKm }))
          .slice(0, 100);
          
        setLeaderboard(sorted as any);
      }

      // 3. Fetch Settings
      const { data: settingsData } = await supabase.from('event_settings').select('*').eq('id', 1).single();
      if (settingsData) {
        setSettings({
          registration_start: formatForInput(settingsData.registration_start),
          registration_end: formatForInput(settingsData.registration_end),
          run_start: formatForInput(settingsData.run_start),
          run_end: formatForInput(settingsData.run_end)
        });
      }

      // 4. Fetch All Emails
      const { data: emailsData } = await supabase.from('users').select('email').neq('role', 'admin');
      if (emailsData) {
        setAllEmails(emailsData.map(u => u.email).filter(Boolean));
      }

      // 5. Fetch Users List
      const { data: usersData } = await supabase.from('users').select('*').neq('role', 'admin').order('created_at', { ascending: false });
      if (usersData) {
        setUsersList(usersData);
      }
    } catch (err) {
      toast.error("Gagal memuat data dari server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected' | 'pending') => {
    const loadingToast = toast.loading("Memproses...");
    try {
      const { error } = await supabase.from('submissions').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      toast.success(`Data berhasil di-${newStatus === 'approved' ? 'terima' : newStatus === 'rejected' ? 'tolak' : 'batalkan'}!`, { id: loadingToast });
      fetchData(); 
    } catch (err) {
      toast.error("Gagal memproses data.", { id: loadingToast });
    }
  };


  const handleExportCSV = (type: 'peserta' | 'laporan') => {
    let csvContent = "data:text/csv;charset=utf-8,\n";
    
    if (type === 'peserta') {
      csvContent += "Rank,Nama,Email,Kelas,Total Jarak (KM),Total Waktu,Rata-rata Pace\n";
      usersList.forEach(u => {
        const timeStr = `${Math.floor(u.totalDurationDecimal / 60)}j ${Math.floor(u.totalDurationDecimal % 60)}m`;
        const avgPace = u.sessionCount > 0 ? (u.totalPaceDecimal / u.sessionCount).toFixed(2) : "0";
        csvContent += `${u.rank},"${u.name}","${u.email}","${u.class_group}",${u.totalDistance},"${timeStr}",${avgPace}\n`;
      });
    } else {
      csvContent += "ID,Nama Peserta,Kelas,Jarak (KM),Pace,Durasi,Status,Tanggal Lapor,Link Bukti\n";
      allSubmissions.forEach(s => {
        const userName = s.users?.name || '';
        const userClass = s.users?.class_group || '';
        const link = s.proof_link || s.screenshot_url || '';
        const date = new Date(s.created_at).toLocaleString('id-ID');
        csvContent += `${s.id},"${userName}","${userClass}",${s.distance_km},${s.pace_minutes},"${s.duration}",${s.status},"${date}","${link}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `smada50k_export_${type}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Berhasil mengunduh data ${type}!`);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingId = toast.loading("Menyimpan pengaturan...");
    try {
      const { error } = await supabase.from('event_settings').upsert({
        id: 1,
        registration_start: new Date(settings.registration_start).toISOString(),
        registration_end: new Date(settings.registration_end).toISOString(),
        run_start: new Date(settings.run_start).toISOString(),
        run_end: new Date(settings.run_end).toISOString(),
      });
      if (error) throw error;
      toast.success("Pengaturan jadwal berhasil disimpan!", { id: loadingId });
      setIsEditingSchedule(false);
    } catch(err) {
      toast.error("Gagal menyimpan jadwal.", { id: loadingId });
    }
  };

  const handleCopyEmails = () => {
    const emailString = allEmails.join(', ');
    navigator.clipboard.writeText(emailString);
    toast.success("Semua email berhasil disalin ke Clipboard!");
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Yakin ingin menghapus peserta ini secara permanen? Semua laporan larinya juga akan hilang.")) return;
    
    const loadingId = toast.loading("Menghapus akun...");
    try {
      await supabase.from('submissions').delete().eq('user_id', userId);
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (error) throw error;
      
      toast.success("Peserta berhasil dihapus!", { id: loadingId });
      fetchData();
    } catch (err) {
      toast.error("Gagal menghapus peserta.", { id: loadingId });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Berhasil keluar.");
    router.push('/admin-login');
  };

  if (isLoading) {
    return (
      <div className="bg-zinc-950 flex flex-col items-center justify-center text-orange-500 min-h-screen">
        <Loader2 size={40} className="animate-spin mb-4" />
        <h2 className="font-bold tracking-widest uppercase">Memuat Panel Admin...</h2>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pb-10 font-sans text-white w-full">
      
      {/* HEADER */}
      <header className="bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="SMADA50K" className="h-8 w-auto" />
            <span className="text-zinc-500 text-xs font-black tracking-widest uppercase bg-zinc-800 px-2 py-1 rounded-md border border-zinc-700">Admin</span>
          </Link>
          <div className="flex gap-4 items-center">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest hidden sm:block">Panitia Pusat</span>
            <button onClick={handleLogout} className="text-red-500 hover:text-white bg-red-500/10 hover:bg-red-500 border border-red-500/20 p-2.5 rounded-xl transition shadow-sm">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* TABS */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex flex-wrap gap-2 md:gap-4 border-b border-zinc-800 pb-2">
          <button onClick={() => setActiveTab('verifikasi')} className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold uppercase tracking-wider text-xs md:text-sm transition-all ${activeTab === 'verifikasi' ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-500/10' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <Clock size={18} /> Verifikasi
          </button>
          <button onClick={() => setActiveTab('peserta')} className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold uppercase tracking-wider text-xs md:text-sm transition-all ${activeTab === 'peserta' ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-500/10' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <Users size={18} /> Peserta
          </button>
          <button onClick={() => setActiveTab('pengaturan')} className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold uppercase tracking-wider text-xs md:text-sm transition-all ${activeTab === 'pengaturan' ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-500/10' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <Settings size={18} /> Jadwal Event
          </button>
          <button onClick={() => setActiveTab('email')} className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold uppercase tracking-wider text-xs md:text-sm transition-all ${activeTab === 'email' ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-500/10' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <Mail size={18} /> Email Blast
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto mt-6 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10 w-full">
        
        {/* KONTEN TAB UTAMA */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* TAB: VERIFIKASI */}
          {activeTab === 'verifikasi' && (
            <>
              <div className="flex justify-between items-end mb-2">
                <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-wide">
                  <Clock size={28} className="text-orange-500" /> Antrean
                </h2>
                <span className="text-xs bg-orange-500 text-white font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                  {pendingSubmissions.length} Laporan
                </span>
              </div>

                              {pendingSubmissions.length > 0 && (
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search size={18} className="text-zinc-500" />
                      </div>
                      <input
                        type="text"
                        placeholder="Cari nama atau kelas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors shadow-inner font-medium text-sm"
                      />
                    </div>
                    
                    <button
                      onClick={handleBulkApproveWajar}
                      disabled={isBulkApproving}
                      className="bg-green-500 text-white font-black uppercase tracking-wider py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 hover:bg-green-600 transition shadow-[0_0_15px_rgba(34,197,94,0.3)] disabled:opacity-50 shrink-0"
                    >
                      {isBulkApproving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                      Terima Massal (Wajar)
                    </button>
                  </div>
                )}
              
              <div className="space-y-4">
                {pendingSubmissions
                  .filter(sub => {
                    const user = sub.users as any;
                    const q = searchQuery.toLowerCase();
                    return user?.name?.toLowerCase().includes(q) || user?.class_group?.toLowerCase().includes(q);
                  })
                  .map((sub) => {
                  const user = sub.users as any;
                  const dateObj = new Date(sub.created_at);
                  const timeStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ', ' + dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                    const paceStatus = getPaceStatus(sub.pace_minutes);
                  
                  return (
                    <div key={sub.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 hover:border-orange-500/50 transition-all flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between group shadow-xl">
                      <div className="flex gap-4 items-center w-full sm:w-auto">
                        <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center text-orange-500 text-xl font-black border border-zinc-700 shadow-inner shrink-0">
                          {user?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="font-bold text-white text-lg leading-tight">{user?.name}</div>
                          <div className="text-xs text-zinc-500 font-bold mt-1 uppercase tracking-wider">{user?.class_group} &bull; {timeStr}</div>
                        </div>
                      </div>
                      <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-6 border-t border-zinc-800 sm:border-0 pt-4 sm:pt-0">
                                              <div className="flex flex-col gap-1 w-full sm:w-auto text-left sm:text-right items-start sm:items-end">
                          <div className="flex items-center gap-3">
                            <span className="text-xl sm:text-2xl font-black text-white">{sub.distance_km} <span className="text-xs text-zinc-500 uppercase">KM</span></span>
                            <span className={`text-[9px] px-2 py-0.5 rounded border font-black uppercase tracking-widest ${paceStatus.color} ${paceStatus.bg}`}>
                              {paceStatus.label}
                            </span>
                          </div>
                          <span className="text-[10px] sm:text-xs font-bold text-zinc-400 tracking-wider">{sub.duration || '?'} � {sub.pace_minutes}/km</span>
                        </div>
                        <div className="h-12 w-px bg-zinc-800 hidden sm:block"></div>
                        <div className="flex gap-2">
                          <a href={sub.proof_link || sub.screenshot_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-orange-500 border border-zinc-700 hover:border-orange-500 rounded-xl transition shadow-sm" title="Buka Bukti">
                            <ExternalLink size={20} />
                          </a>
                          <button onClick={() => handleUpdateStatus(sub.id, 'approved')} className="p-3 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white border border-green-500/30 rounded-xl transition shadow-sm" title="Terima Laporan">
                            <Check size={20} />
                          </button>
                          <button onClick={() => handleUpdateStatus(sub.id, 'rejected')} className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 rounded-xl transition shadow-sm" title="Tolak Laporan">
                            <X size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {searchQuery && pendingSubmissions.length > 0 && pendingSubmissions.filter(sub => {
                   const user = sub.users as any;
                   const q = searchQuery.toLowerCase();
                   return user?.name?.toLowerCase().includes(q) || user?.class_group?.toLowerCase().includes(q);
                }).length === 0 && (
                  <div className="text-center py-10 flex flex-col items-center justify-center">
                    <Search size={48} className="text-zinc-700 mb-4" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Data Tidak Ditemukan</h3>
                  </div>
                )}

                {pendingSubmissions.length === 0 && (
                  <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center text-zinc-500">
                    <Check size={48} className="mb-4 text-zinc-700" />
                    <h3 className="text-lg font-black uppercase tracking-widest text-zinc-400">Kerja Bagus!</h3>
                    <p className="text-sm font-medium mt-1">Tidak ada antrean laporan baru saat ini.</p>
                  </div>
                )}
              </div>
            </>
          )}

          
            {/* TAB: RIWAYAT */}
            {activeTab === 'riwayat' && (
              <>
                <div className="flex justify-between items-end mb-2">
                  <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-wide">
                    <CheckCircle size={28} className="text-orange-500" /> Riwayat Laporan
                  </h2>
                  <span className="text-xs bg-zinc-700 text-white font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                    {historySubmissions.length} Laporan
                  </span>
                </div>

                <div className="relative mb-6">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search size={18} className="text-zinc-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari nama atau kelas di riwayat..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors shadow-inner font-medium text-sm"
                  />
                </div>
                
                <div className="space-y-4">
                  {historySubmissions
                    .filter(sub => {
                      const user = sub.users as any;
                      const q = searchQuery.toLowerCase();
                      return user?.name?.toLowerCase().includes(q) || user?.class_group?.toLowerCase().includes(q);
                    })
                    .map(sub => {
                      const user = sub.users as any;
                      const timeStr = new Date(sub.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
                      
                      return (
                      <div key={sub.id} className="bg-zinc-900 border border-zinc-800 p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg hover:border-zinc-700 transition relative">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-xl shrink-0 ${sub.status === 'approved' ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}>
                            {user?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="font-bold text-white text-lg leading-tight">{user?.name}</div>
                            <div className="text-xs text-zinc-500 font-bold mt-1 uppercase tracking-wider">{user?.class_group} &bull; {timeStr}</div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                          <div className="flex flex-col gap-1 w-full sm:w-auto text-left sm:text-right items-start sm:items-end">
                            <div className="flex items-center gap-3">
                              <span className="text-xl font-black text-white">{sub.distance_km} <span className="text-xs text-zinc-500 uppercase">KM</span></span>
                            </div>
                            <span className="text-[10px] sm:text-xs font-bold text-zinc-400 tracking-wider">{sub.status === 'approved' ? 'DITERIMA' : 'DITOLAK'}</span>
                          </div>
                          
                          <div className="h-12 w-px bg-zinc-800 hidden sm:block"></div>
                          
                          <div className="flex gap-2 w-full sm:w-auto">
                            <button onClick={() => handleUpdateStatus(sub.id, 'pending')} className="flex-1 sm:flex-none p-3 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700 rounded-xl transition shadow-sm text-xs font-bold flex items-center justify-center gap-2" title="Kembalikan ke Antrean">
                              Batalkan / Undo
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* TAB: PESERTA */}
          {activeTab === 'peserta' && (
            <>
              <div className="flex justify-between items-end mb-2">
                <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-wide">
                  <Users size={28} className="text-orange-500" /> Daftar Peserta
                </h2>
                <span className="text-xs bg-orange-500 text-white font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                  {usersList.length} Akun
                </span>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={18} className="text-zinc-500" />
                </div>
                <input
                  type="text"
                  placeholder="Cari nama, email, atau kelas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors shadow-inner font-medium text-sm"
                />
              </div>
              
              <div className="space-y-4">
                {usersList
                  .filter(user => {
                    const q = searchQuery.toLowerCase();
                    return user.name?.toLowerCase().includes(q) || user.email?.toLowerCase().includes(q) || user.class_group?.toLowerCase().includes(q);
                  })
                  .map((user) => {
                  const dateObj = new Date(user.created_at);
                  const timeStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                  
                  return (
                    <div key={user.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 hover:border-red-500/30 transition-all flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between group shadow-xl">
                      <div className="flex gap-4 items-center w-full sm:w-auto overflow-hidden">
                        <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500 text-lg font-black border border-zinc-700 shadow-inner shrink-0 group-hover:text-red-500 transition-colors">
                          {user.name?.charAt(0) || '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-white text-base leading-tight truncate">{user.name}</div>
                          <div className="text-xs text-zinc-400 mt-1 truncate">{user.email}</div>
                          <div className="text-[10px] text-zinc-500 font-bold mt-1 uppercase tracking-wider">{user.class_group} &bull; Bergabung {timeStr}</div>
                        </div>
                      </div>
                      
                      <button onClick={() => handleDeleteUser(user.id)} className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 rounded-xl transition shadow-sm shrink-0 self-end sm:self-auto" title="Hapus Akun Permanen">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )
                })}

                {searchQuery && usersList.filter(user => {
                   const q = searchQuery.toLowerCase();
                   return user.name?.toLowerCase().includes(q) || user.email?.toLowerCase().includes(q) || user.class_group?.toLowerCase().includes(q);
                }).length === 0 && (
                  <div className="text-center py-10 flex flex-col items-center justify-center">
                    <Search size={48} className="text-zinc-700 mb-4" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Akun Tidak Ditemukan</h3>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB: PENGATURAN EVENT */}
          {activeTab === 'pengaturan' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-wide mb-6 border-b border-zinc-800 pb-4">
                <Settings size={24} className="text-orange-500" /> Jadwal Event
              </h2>
              <form onSubmit={handleSaveSettings} className="space-y-6 relative">
                
                {/* OVERLAY TERKUNCI */}
                {!isEditingSchedule && (
                  <div className="absolute inset-0 z-10 bg-zinc-950/70 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center border border-zinc-800">
                    <div className="bg-zinc-900 p-4 rounded-full mb-4 shadow-[0_0_30px_rgba(249,115,22,0.15)] border border-zinc-800">
                      <Lock size={36} className="text-orange-500" />
                    </div>
                    <h3 className="text-white font-black text-xl uppercase tracking-widest mb-2">Jadwal Terkunci</h3>
                    <p className="text-zinc-400 text-sm mb-6 text-center px-4 max-w-xs leading-relaxed">
                      Jadwal event saat ini sedang aktif dan diamankan dari perubahan tidak sengaja.
                    </p>
                    <button 
                      type="button" 
                      onClick={() => setIsEditingSchedule(true)}
                      className="px-6 py-3 bg-zinc-800 hover:bg-orange-500 text-white font-bold rounded-xl transition-all flex items-center gap-2 uppercase tracking-widest text-sm border border-zinc-700 hover:border-orange-500 shadow-lg"
                    >
                      Buka Kunci & Edit
                    </button>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-orange-500 uppercase tracking-widest">Periode Pendaftaran</h3>
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Dibuka</label>
                      <div className="flex gap-2">
                        <input type="date" disabled={!isEditingSchedule} required value={settings.registration_start.split('T')[0] || ''} onChange={e => setSettings({...settings, registration_start: `${e.target.value}T${settings.registration_start.split('T')[1] || '00:00'}`})} className="w-[60%] bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:border-orange-500 outline-none [color-scheme:dark] disabled:opacity-50" />
                        <input type="time" disabled={!isEditingSchedule} required value={settings.registration_start.split('T')[1] || '00:00'} onChange={e => setSettings({...settings, registration_start: `${settings.registration_start.split('T')[0] || new Date().toISOString().split('T')[0]}T${e.target.value}`})} className="w-[40%] bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:border-orange-500 outline-none [color-scheme:dark] disabled:opacity-50" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Ditutup</label>
                      <div className="flex gap-2">
                        <input type="date" disabled={!isEditingSchedule} required value={settings.registration_end.split('T')[0] || ''} onChange={e => setSettings({...settings, registration_end: `${e.target.value}T${settings.registration_end.split('T')[1] || '23:59'}`})} className="w-[60%] bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:border-orange-500 outline-none [color-scheme:dark] disabled:opacity-50" />
                        <input type="time" disabled={!isEditingSchedule} required value={settings.registration_end.split('T')[1] || '23:59'} onChange={e => setSettings({...settings, registration_end: `${settings.registration_end.split('T')[0] || new Date().toISOString().split('T')[0]}T${e.target.value}`})} className="w-[40%] bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:border-orange-500 outline-none [color-scheme:dark] disabled:opacity-50" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-orange-500 uppercase tracking-widest">Periode Lari (Submit)</h3>
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Mulai Submit</label>
                      <div className="flex gap-2">
                        <input type="date" disabled={!isEditingSchedule} required value={settings.run_start.split('T')[0] || ''} onChange={e => setSettings({...settings, run_start: `${e.target.value}T${settings.run_start.split('T')[1] || '00:00'}`})} className="w-[60%] bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:border-orange-500 outline-none [color-scheme:dark] disabled:opacity-50" />
                        <input type="time" disabled={!isEditingSchedule} required value={settings.run_start.split('T')[1] || '00:00'} onChange={e => setSettings({...settings, run_start: `${settings.run_start.split('T')[0] || new Date().toISOString().split('T')[0]}T${e.target.value}`})} className="w-[40%] bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:border-orange-500 outline-none [color-scheme:dark] disabled:opacity-50" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Tutup Submit</label>
                      <div className="flex gap-2">
                        <input type="date" disabled={!isEditingSchedule} required value={settings.run_end.split('T')[0] || ''} onChange={e => setSettings({...settings, run_end: `${e.target.value}T${settings.run_end.split('T')[1] || '23:59'}`})} className="w-[60%] bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:border-orange-500 outline-none [color-scheme:dark] disabled:opacity-50" />
                        <input type="time" disabled={!isEditingSchedule} required value={settings.run_end.split('T')[1] || '23:59'} onChange={e => setSettings({...settings, run_end: `${settings.run_end.split('T')[0] || new Date().toISOString().split('T')[0]}T${e.target.value}`})} className="w-[40%] bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:border-orange-500 outline-none [color-scheme:dark] disabled:opacity-50" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
                  {isEditingSchedule && (
                    <button type="button" onClick={() => setIsEditingSchedule(false)} className="px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-sm transition text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800">
                      Batal
                    </button>
                  )}
                  <button type="submit" disabled={!isEditingSchedule} className={`text-white font-black uppercase tracking-wider py-3 px-8 rounded-xl flex items-center gap-2 transition ${isEditingSchedule ? 'bg-orange-500 hover:bg-orange-600 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'bg-zinc-800 opacity-0 pointer-events-none'}`}>
                    Simpan Jadwal <Check size={18} />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: EMAIL BLAST */}
          {activeTab === 'email' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-wide mb-6 border-b border-zinc-800 pb-4">
                <Mail size={24} className="text-orange-500" /> Pengingat / Email Blast
              </h2>
              
              <div className="space-y-6 text-zinc-300">
                <p className="text-sm font-medium leading-relaxed">
                  Terdapat <strong className="text-white">{allEmails.length}</strong> alamat email siswa/guru yang sudah terdaftar. 
                  Karena aplikasi ini berjalan tanpa server email berbayar (SMTP), Anda bisa menggunakan fitur BCC di Gmail atau aplikasi Mailchimp untuk mengirim pengingat motivasi.
                </p>

                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 max-h-40 overflow-y-auto font-mono text-xs text-zinc-500 break-all">
                  {allEmails.join(', ')}
                </div>

                <div className="pt-2">
                  <button onClick={handleCopyEmails} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-wider py-4 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-[0_0_15px_rgba(249,115,22,0.3)] border border-orange-400/50">
                    <Copy size={20} /> Copy Seluruh Email ({allEmails.length})
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* KOLOM KANAN - LEADERBOARD */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-wide mb-2">
            <Trophy size={28} className="text-yellow-500" /> Top 100 Global
          </h2>
          
          <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 space-y-4 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-orange-600 rounded-full mix-blend-screen filter blur-[100px] opacity-10 pointer-events-none"></div>
            
            {leaderboard.map((user) => (
              <div key={user.rank} className="flex items-center gap-4 bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50 relative z-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-xl shrink-0
                  ${user.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-[0_0_15px_rgba(250,204,21,0.4)] border border-yellow-300/50' : 
                    user.rank === 2 ? 'bg-gradient-to-br from-zinc-300 to-zinc-500 border border-zinc-300/50' : 
                    user.rank === 3 ? 'bg-gradient-to-br from-orange-700 to-amber-900 border border-orange-500/30' : 
                    'bg-zinc-800 border border-zinc-700 text-zinc-500'}`}>
                  {user.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-white text-base truncate">{user.name}</div>
                  <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-0.5">{user.kelas}</div>
                </div>
                <div className="font-black text-orange-500 text-2xl text-right shrink-0">
                  {user.totalKm} <span className="text-xs text-zinc-500 block -mt-1 uppercase tracking-widest">KM</span>
                </div>
              </div>
            ))}
            
            {leaderboard.length === 0 && (
              <div className="text-center text-zinc-500 font-bold text-sm py-10">Belum ada data pelari yang disetujui.</div>
            )}
          </div>
        </div>
        
      </main>

    </div>
  );
}
