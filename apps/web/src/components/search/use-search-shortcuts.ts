'use client';

import { useEffect, useState } from 'react';
import { useSearchStore } from '@/stores/search.store';

function isInteractiveElement(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable;
}

export function useSearchShortcuts() {
  const [isMac, setIsMac] = useState(false);
  const { isOpen, openSearch, closeSearch } = useSearchStore();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMac(/Mac|iPod|iPhone|iPad/.test(navigator.userAgent));
    }
  }, []);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrlK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (isCmdOrCtrlK) {
        e.preventDefault();
        if (isOpen) {
          closeSearch();
        } else {
          openSearch();
        }
        return;
      }

      const isSlashKey = e.key === '/' && !isOpen;
      const hasModifiers = e.ctrlKey || e.metaKey || e.altKey;
      if (isSlashKey && !hasModifiers && !isInteractiveElement(e.target)) {
        e.preventDefault();
        openSearch();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, openSearch, closeSearch]);

  return { isMac };
}
