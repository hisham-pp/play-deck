'use client';

import { HelpCircle, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@playdeck/ui';
import { GRAVITY_COURSES } from '../engine/course-catalog';
import { gravityShiftSoundService } from '../services/gravity-shift-sound.service';

export interface GravityShiftToolbarProps {
  selectedCourseId: string;
  onSelectCourse: (courseId: string) => void;
  onRestart: () => void;
  onLeave?: () => void;
  isMultiplayer?: boolean;
}

export function GravityShiftToolbar({
  selectedCourseId,
  onSelectCourse,
  onRestart,
  onLeave,
  isMultiplayer = false,
}: GravityShiftToolbarProps) {
  const [soundEnabled, setSoundEnabled] = useState(gravityShiftSoundService.isSoundEnabled());
  const [showControls, setShowControls] = useState(false);

  const toggleSound = () => {
    const next = !soundEnabled;
    gravityShiftSoundService.setSoundEnabled(next);
    setSoundEnabled(next);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#111827] rounded-xl border border-[#232f45] shadow-lg">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Course:
        </span>
        <select
          value={selectedCourseId}
          disabled={isMultiplayer}
          onChange={(e) => onSelectCourse(e.target.value)}
          className="bg-[#1c2438] text-sm text-slate-200 border border-[#232f45] rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-400 disabled:opacity-60 cursor-pointer"
        >
          {GRAVITY_COURSES.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        {/* Controls Modal / Popover Toggle */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowControls((prev) => !prev)}
            className="text-slate-300 hover:text-white"
          >
            <HelpCircle className="w-4 h-4 mr-1" />
            Controls
          </Button>

          {showControls && (
            <div className="absolute right-0 top-full mt-2 w-72 p-4 bg-[#111827] border border-[#232f45] rounded-xl shadow-2xl z-30 text-xs text-slate-300">
              <h4 className="font-bold text-amber-400 mb-2 uppercase tracking-wide">
                Flight Controls
              </h4>
              <ul className="space-y-1.5">
                <li>
                  <span className="font-mono text-cyan-400">A / D</span> or{' '}
                  <span className="font-mono text-cyan-400">Arrows</span>: Move
                </li>
                <li>
                  <span className="font-mono text-cyan-400">Space / W / Up</span>: Jump
                </li>
                <li>
                  <span className="font-mono text-amber-400">Q / E</span>: Invert Gravity (CCW / CW)
                </li>
                <li>
                  <span className="font-mono text-amber-400">Shift + Arrows</span>: Direct 4-Way
                  Shift
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Audio Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSound}
          className="text-slate-300 hover:text-white"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </Button>

        {/* Restart Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onRestart}
          className="bg-[#1c2438] hover:bg-[#232f45] text-slate-200 border-[#232f45]"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Restart
        </Button>

        {/* Leave Room Button */}
        {onLeave && (
          <Button variant="outline" size="sm" onClick={onLeave}>
            Leave
          </Button>
        )}
      </div>
    </div>
  );
}
