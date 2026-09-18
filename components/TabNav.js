'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TabNav({ tabs }) {
  const pathname = usePathname();

  return (
    <nav className="max-w-6xl mx-auto px-6 pt-4 flex gap-2 flex-wrap">
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={
              'px-4 py-2 rounded-lg text-sm font-semibold border ' +
              (active
                ? 'bg-brand text-white border-brand'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50')
            }
          >
            {tab.label}
          </Link>
        );
      })}
      {tabs.length === 0 && (
        <p className="text-sm text-gray-400 py-2">Tài khoản chưa được cấp quyền xem tab nào.</p>
      )}
    </nav>
  );
}
