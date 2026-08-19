import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SMADA50K",
  description: "Virtual Run App for SMAN 2 Lumajang",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex flex-col min-h-screen bg-zinc-950 text-white font-sans relative overflow-x-hidden">
        {/* GLOBAL SPORTY BACKGROUND ELEMENTS */}
        <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-600 rounded-full mix-blend-screen filter blur-[120px] opacity-10 pointer-events-none z-0"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-orange-500 rounded-full mix-blend-screen filter blur-[120px] opacity-7 pointer-events-none z-0"></div>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col relative z-10 w-full">
          {children}
        </main>
        
        {/* GLOBAL COPYRIGHT FOOTER */}
        <footer className="w-full text-center py-6 border-t border-zinc-900 bg-zinc-950 relative z-20 mt-auto">
          <p className="text-[10px] md:text-xs font-black text-zinc-600 tracking-[0.2em] uppercase">
            © 2026 Vxtamax. All rights reserved.
          </p>
        </footer>

        <Toaster 
          position="top-center" 
          toastOptions={{ 
            style: { background: '#27272a', color: '#fff', border: '1px solid #3f3f46', borderRadius: '12px' },
            success: { iconTheme: { primary: '#f97316', secondary: '#fff' } }
          }} 
        />
      </body>
    </html>
  );
}
