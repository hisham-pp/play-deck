'use client';

import { Check, MessageSquare } from 'lucide-react';
import React, { useState } from 'react';

import { Badge, Button } from '@playdeck/ui';

export interface TelephoneDescribeProps {
  previousDrawingData: string;
  timeRemaining: number;
  onSubmit: (description: string) => void;
}

export const TelephoneDescribe: React.FC<TelephoneDescribeProps> = ({
  previousDrawingData,
  timeRemaining,
  onSubmit,
}) => {
  const [description, setDescription] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    onSubmit(description.trim());
  };

  const isSvg = previousDrawingData.trim().startsWith('<svg');

  return (
    <div className="flex flex-col gap-5 w-full max-w-2xl mx-auto items-center">
      {/* Header Banner */}
      <div className="w-full bg-[#0c1322] border border-amber-500/40 rounded-xl p-4 text-center shadow-lg">
        <div className="text-xs uppercase font-bold tracking-widest text-amber-400 mb-1 flex items-center justify-center gap-2">
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <span>Describe What You See</span>
          <Badge variant={timeRemaining <= 10 ? 'warning' : 'arcade'} className="font-mono text-xs">
            ⏱️ {timeRemaining}s
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          What on earth did the previous artist draw? Guess with confidence!
        </p>
      </div>

      {/* Drawing Showcase */}
      <div className="w-full max-w-[560px] aspect-[14/9.5] rounded-2xl overflow-hidden border-4 border-amber-950/60 shadow-2xl bg-[#fdfbf7] flex items-center justify-center p-2 relative">
        {isSvg ? (
          <div
            className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-h-full [&>svg]:object-contain"
            dangerouslySetInnerHTML={{ __html: previousDrawingData }}
          />
        ) : (
          <img
            src={previousDrawingData}
            alt="Previous drawing in chain"
            className="w-full h-full object-contain pointer-events-none select-none"
          />
        )}
      </div>

      {/* Text Input Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full bg-[#0c1322]/95 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center shadow-md"
      >
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={80}
            placeholder="e.g. A grumpy pirate eating a pizza slice..."
            autoFocus
            className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <span className="absolute right-3 top-3.5 text-xs text-slate-500">
            {description.length}/80
          </span>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={!description.trim()}
          className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3"
        >
          <Check className="w-4 h-4 mr-1.5" />
          Submit Guess
        </Button>
      </form>
    </div>
  );
};
