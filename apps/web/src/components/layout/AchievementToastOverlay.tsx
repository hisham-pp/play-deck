'use client';

import { useEffect, useState } from 'react';
import { useAchievementsStore } from '@/stores/achievements.store';

export function AchievementToastOverlay() {
  const { toasts, dismissToast, loadUnlocked } = useAchievementsStore();
  const [mounted, setMounted] = useState(false);

  // Load user's unlocked achievements from Supabase on mount
  useEffect(() => {
    setMounted(true);
    loadUnlocked();
  }, [loadUnlocked]);

  // Auto-dismiss toasts after 5 seconds
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        dismissToast(toasts[0].id);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toasts, dismissToast]);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-gray-900 border border-amber-500/30 p-4 rounded-xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-8 fade-in pointer-events-auto"
        >
          <div className="text-4xl bg-gray-800 p-2 rounded-full border border-gray-700">
            {toast.icon}
          </div>
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-amber-500 font-bold">
              Achievement Unlocked
            </span>
            <span className="text-gray-100 font-semibold">{toast.title}</span>
          </div>
          <div className="ml-4 pl-4 border-l border-gray-700 text-sm font-mono text-amber-400">
            +{toast.points} XP
          </div>
        </div>
      ))}
    </div>
  );
}
