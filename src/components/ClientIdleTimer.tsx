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

    const logout = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.auth.signOut();
        toast.error('Sesi Anda telah habis karena tidak ada aktivitas selama 30 menit. Silakan login kembali.', {
          duration: 6000,
        });
        router.push('/login');
      }
    };

    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(logout, IDLE_TIME);
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
