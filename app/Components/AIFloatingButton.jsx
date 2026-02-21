'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';

export default function AIFloatingButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide on the AI chat page itself
  if (pathname === '/tanya-ai') return null;

  return (
    <button
      onClick={() => router.push('/tanya-ai')}
      aria-label='Tanya AI'
      className='
        fixed bottom-[96px] right-5 z-[99999]
        w-13 h-13
        flex items-center justify-center
        rounded-full
        shadow-lg shadow-purple-500/40
        bg-gradient-to-br from-[#7c3aed] to-[#5b2d8b]
        text-white
        transition-all duration-200
        hover:scale-110 hover:shadow-xl hover:shadow-purple-500/50
        active:scale-95
      '
      style={{ width: 52, height: 52 }}
    >
      {/* Pulse ring */}
      <span className='absolute inline-flex w-full h-full rounded-full bg-purple-400 opacity-30 animate-ping' />
      <Sparkles size={22} strokeWidth={2} className='relative z-10' />
    </button>
  );
}
