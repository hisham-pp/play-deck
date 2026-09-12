import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import React from 'react';

export function AuthModalNotice({
  error,
  success,
  onSwitchToSignIn,
}: {
  error: string | null;
  success: string | null;
  onSwitchToSignIn?: () => void;
}) {
  const isAlreadyExists = Boolean(error && error.includes('already exists'));

  return (
    <>
      {error && (
        <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
          {isAlreadyExists && onSwitchToSignIn && (
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 ml-6 self-start cursor-pointer"
            >
              <span>Switch to Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}
    </>
  );
}
