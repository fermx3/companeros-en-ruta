'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useAuth } from '@/components/providers/AuthProvider';

interface DashboardHeaderProps {
  title: string;
  displayName?: string;
  headerExtra?: ReactNode;
}

export function DashboardHeader({ title, displayName, headerExtra }: DashboardHeaderProps) {
  const router = useRouter();
  const { signOut, userProfile } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const profile = userProfile as { first_name?: string; last_name?: string } | null;
  const defaultName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ');
  const fullName = displayName || defaultName || 'Usuario';
  const initials = fullName.split(' ').map(w => w.charAt(0)).join('').toUpperCase().slice(0, 2) || '?';

  const handleLogout = async () => {
    setMenuOpen(false);
    await signOut();
    router.push('/login');
  };

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

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
          {headerExtra}
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          {/* User avatar with dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
            >
              <span className="text-gray-600 font-medium text-xs">{initials}</span>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">{fullName}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
