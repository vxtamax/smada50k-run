"use client";
import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function ClientIdleTimer() {
  const router = useRouter();
  const pathname = usePathname();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 30 Menit = 30 * 60 * 1000 milidetik
  const IDLE_TIME = 30 * 60 * 1000; 

  useEffect(() => {
    // Jangan jalankan timer di halaman publik seperti login/register/forgot-password
    const publicPages = ['/login', '/register', '/forgot-password', '/'];
    if (publicPages.includes(pathname)) return;

    const logout = async (reason = 'tidak ada aktivitas selama 30 menit') => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.auth.signOut();
        localStorage.removeItem('smada_last_activity');
        toast.error(`Sesi Anda telah habis karena ${reason}. Silakan login kembali.`, {
          duration: 6000,
        });
        router.push('/login');
      }
    };

    // Saat baru buka web, cek apakah web ditutup terlalu lama (lebih dari 30 menit)
    const lastActivity = localStorage.getItem('smada_last_activity');
    if (lastActivity) {
      const timeSinceLastActivity = Date.now() - parseInt(lastActivity, 10);
      if (timeSinceLastActivity > IDLE_TIME) {
        logout('Anda meninggalkan web terlalu lama');
        return; // Jangan lanjut set timer
      }
    }

    const resetTimer = () => {
      // Simpan stempel waktu aktivitas terakhir ke LocalStorage
      localStorage.setItem('smada_last_activity', Date.now().toString());

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => logout('tidak ada aktivitas selama 30 menit'), IDLE_TIME);
    };

    // Jalankan timer pertama kali
    resetTimer();

    // Daftar aktivitas user yang me-reset timer
    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
    const handleActivity = () => resetTimer();

    events.forEach(event => window.addEventListener(event, handleActivity));

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [pathname, router]);

  return null;
}
