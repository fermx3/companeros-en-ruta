'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useAuth } from '@/components/providers/AuthProvider';

interface DashboardHeaderProps {
  title: string;
  displayName?: string;
  headerExtra?: ReactNode;
  profileHref?: string;
}

export function DashboardHeader({ title, displayName, headerExtra, profileHref }: DashboardHeaderProps) {
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
    <header className="sticky top-0 z-50 bg-white/40 backdrop-blur-md supports-[backdrop-filter]:bg-white/30 lg:bg-white/80 lg:supports-[backdrop-filter]:bg-white/60 lg:border-b lg:border-gray-200">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full border border-secondary flex items-center justify-center">
            <Image
              src="/perfect-logo-icon.png"
              alt="CR"
              width={22}
              height={22}
              className="object-contain"
            />
          </div>
          <h1 className="text-lg font-bold text-navy">{title}</h1>
          {headerExtra}
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          {/* User avatar with dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary-light transition-colors"
            >
              <span className="text-white font-bold text-sm">{initials}</span>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">{fullName}</p>
                </div>
                {profileHref && (
                  <Link
                    href={profileHref}
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Mi Perfil
                  </Link>
                )}
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
