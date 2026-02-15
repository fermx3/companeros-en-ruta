'use client';

import Image from 'next/image';
import { NotificationBell } from '@/components/notifications/NotificationBell';

interface DashboardHeaderProps {
  title: string;
}

export function DashboardHeader({ title }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-200">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg border-1 border-blue-600 flex items-center justify-center shadow-sm">
            <Image
              src="/perfect-logo-icon.png"
              alt="CR"
              width={20}
              height={20}
              className="object-contain"
            />
          </div>
          <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        </div>
        <NotificationBell />
      </div>
    </header>
  );
}
