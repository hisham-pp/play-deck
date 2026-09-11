'use client';

import { X } from 'lucide-react';
import React, { useEffect } from 'react';
import { cn } from './utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const MODAL_SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative w-full rounded-xl border border-surface-border bg-surface-raised shadow-arcade z-10 overflow-hidden flex flex-col',
          MODAL_SIZES[size],
        )}
      >
        <div className="flex items-start justify-between p-6 pb-4 border-b border-surface-border">
          <div>
            {title && (
              <h3 className="text-lg font-bold text-deck-950 dark:text-white font-display">
                {title}
              </h3>
            )}
            {description && <p className="text-xs text-deck-500 mt-1">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-deck-400 hover:text-deck-900 dark:hover:text-white hover:bg-surface-overlay transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">{children}</div>

        {footer && (
          <div className="p-4 px-6 border-t border-surface-border bg-surface-overlay/60 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
