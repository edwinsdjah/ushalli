'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clock, Compass, Map, Video, Moon, BookOpen } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Jadwal', icon: Clock },
  { href: '/compass', label: 'Kompas', icon: Compass },
  { href: '/ramadhan', label: 'Ramadhan', icon: Moon },
  { href: '/quran', label: 'Quran', icon: BookOpen },
  { href: '/pathway', label: 'Peta', icon: Map },
  { href: '/videos', label: 'Video', icon: Video },
];

export default function MainNavigation({ visible = true }) {
  const pathname = usePathname();

  return (
    <div
      className={`
        fixed bottom-6 left-1/2 z-[1000]
        -translate-x-1/2
        w-[90%] max-w-md
        rounded-2xl
        bg-white
        shadow-xl
        p-2
        flex gap-2
        transition-all duration-300
        ${
          visible
            ? 'translate-y-0 opacity-100'
            : 'translate-y-24 opacity-0 pointer-events-none'
        }
      `}
    >
      {NAV_ITEMS.map(item => {
        const active = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex flex-1 flex-col items-center justify-center
              gap-1 py-2 rounded-xl
              text-xs font-medium
              transition-all duration-300
              ${
                active
                  ? 'bg-[var(--color-royal)] text-white shadow-md'
                  : 'text-purple-700 hover:bg-purple-50'
              }
            `}
          >
            <Icon size={18} strokeWidth={2.2} />
          </Link>
        );
      })}
    </div>
  );
}
