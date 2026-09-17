'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GameCategoryBadge, GameStatusBadge } from '@/components/game/GameBadge';
import { RoomVoiceDock } from '@/features/voice/components/RoomVoiceDock';
import { usePlayerStore } from '@/stores/player.store';
import { usePreferencesStore } from '@/stores/preferences.store';
import { useSummitGame } from '../hooks/use-summit-game';
import { useSummitInput } from '../hooks/use-summit-input';
import { useSummitLoop } from '../hooks/use-summit-loop';
import { SummitGameOver, type RaceSummary } from './SummitGameOver';
import { SummitHud } from './SummitHud';
import { SummitOnlinePanel } from './SummitOnlinePanel';
import { CountdownOverlay, PauseScreen, StartScreen } from './SummitOverlays';
import { SummitPedals } from './SummitPedals';
import { SummitUpgrades } from './SummitUpgrades';

const HUD_INSET = 84;

function useFullscreen(target: React.RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    const sync = () => setIsFullscreen(document.fullscreenElement === target.current);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, [target]);
  const toggle = useCallback(() => {
    const el = target.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    else void el.requestFullscreen?.().catch(() => undefined);
  }, [target]);
  return { isFullscreen, toggle };
}

export function SummitRushGame() {
  const game = useSummitGame();
  const { phase, mode, race, inRace, hud, result, progress } = game;
  const player = usePlayerStore((s) => s.player);
  const soundEnabled = usePreferencesStore((s) => s.soundEnabled);
  const reducedMotion = usePreferencesStore((s) => s.reducedMotion);
  const toggleSound = usePreferencesStore((s) => s.toggleSound);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const fullscreen = useFullscreen(stageRef);

  const isDriving = phase === 'playing';
  const handleConfirm = useCallback(() => {
    if (phase === 'menu' && mode === 'solo') game.startSolo();
    else if (phase === 'over' && !inRace) game.startSolo();
  }, [game, inRace, mode, phase]);

  const { inputRef, setPedal } = useSummitInput(phase !== 'upgrades', {
    onPauseToggle: game.togglePause,
    onRestart: () => {
      if (!inRace && (phase === 'playing' || phase === 'paused' || phase === 'over'))
        game.startSolo();
    },
    onConfirm: handleConfirm,
  });

  useSummitLoop({
    canvasRef,
    containerRef: stageRef,
    worldRef: game.worldRef,
    inputRef,
    simulate: phase === 'playing' || phase === 'over',
    bestDistance: progress.bestDistance,
    hudInset: HUD_INSET,
    reducedMotion,
    getGhosts: () => (inRace ? race.getGhosts(performance.now()) : []),
    getFocus: game.getFocus,
    onEvents: game.onEvents,
    onFrame: game.onFrame,
    onHud: game.onHud,
  });

  // Belt and braces for touch-action: stop the page scrolling while driving
  // (menus stay scrollable).
  const blockTouchRef = useRef(false);
  blockTouchRef.current = isDriving || phase === 'countdown';
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const block = (e: TouchEvent) => {
      if (blockTouchRef.current && e.cancelable) e.preventDefault();
    };
    stage.addEventListener('touchmove', block, { passive: false });
    return () => stage.removeEventListener('touchmove', block);
  }, []);

  // Auto-pause a solo run when the tab is hidden.
  useEffect(() => {
    const onHide = () => {
      if (document.hidden && phase === 'playing' && !inRace) game.togglePause();
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [game, inRace, phase]);

  const rivalName = race.opponent?.displayName ?? 'Rival';
  const raceSummary: RaceSummary | null = inRace
    ? {
        rivalName,
        rivalDistance: race.rival.finish?.distance ?? race.rival.distance,
        rivalScore: race.rival.finish?.score ?? race.rival.score,
        rivalDone: Boolean(race.rival.finish) || game.rivalGone,
        outcome: game.raceOutcome,
        isHost: race.isHost,
        isReady: game.isReady,
        onRematch: race.startRace,
        onReady: game.sendReady,
      }
    : null;

  const showHud = hud && (phase === 'playing' || phase === 'paused' || phase === 'countdown');
  const onlinePanel = (
    <SummitOnlinePanel
      race={race}
      hasPlayer={Boolean(player)}
      isReady={game.isReady}
      onReady={game.sendReady}
    />
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-3 py-2">
      <div className="flex items-center justify-between">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-xs font-medium text-deck-500 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to catalog</span>
        </Link>
        <div className="flex items-center gap-2">
          <GameStatusBadge status="available" label="Ready to Play" />
          <GameCategoryBadge category="arcade" />
        </div>
      </div>

      <div
        ref={stageRef}
        className="relative h-[min(78dvh,680px)] min-h-[320px] w-full touch-none select-none overflow-hidden overscroll-none rounded-2xl border border-surface-border bg-[#5ab8f0] shadow-2xl"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block h-full w-full"
          aria-label="Summit Rush game view"
        />

        {showHud && (
          <SummitHud
            hud={hud}
            bestDistance={progress.bestDistance}
            rival={
              inRace
                ? {
                    name: rivalName,
                    distance: race.rival.finish?.distance ?? race.rival.distance,
                    finished: Boolean(race.rival.finish),
                  }
                : null
            }
            hint={game.hint}
            canPause={!inRace && phase === 'playing'}
            soundEnabled={soundEnabled}
            isFullscreen={fullscreen.isFullscreen}
            onPause={game.togglePause}
            onToggleSound={() => void toggleSound()}
            onToggleFullscreen={fullscreen.toggle}
          />
        )}
        {isDriving && <SummitPedals onPedal={setPedal} />}

        {phase === 'countdown' && <CountdownOverlay value={game.countdown} rivalName={rivalName} />}
        {isDriving && game.showGo && <CountdownOverlay value={0} rivalName={null} />}

        {phase === 'menu' && (
          <StartScreen
            progress={progress}
            mode={mode}
            onModeChange={game.setMode}
            onStart={game.startSolo}
            onUpgrades={() => game.openUpgrades('menu')}
            onlinePanel={onlinePanel}
          />
        )}
        {phase === 'paused' && (
          <PauseScreen
            onResume={game.togglePause}
            onRestart={game.startSolo}
            onQuit={game.endRunEarly}
          />
        )}
        {phase === 'over' && result && (
          <SummitGameOver
            result={result}
            progress={progress}
            race={raceSummary}
            onPlayAgain={game.startSolo}
            onUpgrades={() => game.openUpgrades('over')}
            onMenu={game.toMenu}
          />
        )}
        {phase === 'upgrades' && (
          <SummitUpgrades
            progress={progress}
            onBuy={game.handleBuy}
            onBack={() =>
              game.upgradesReturn === 'over' && result ? game.setPhase('over') : game.toMenu()
            }
            backLabel={game.upgradesReturn === 'over' && result ? 'Results' : 'Menu'}
            onPlay={inRace ? null : game.startSolo}
          />
        )}
      </div>

      {mode === 'online' && race.roomCode && (
        <div className="flex flex-col gap-3 rounded-2xl border border-surface-border bg-surface-base p-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="text-xs text-deck-400">
            <p className="font-bold uppercase tracking-wider text-amber-400">
              Race room {race.roomCode}
            </p>
            <p className="mt-1">
              {race.opponent ? `Racing ${rivalName}` : 'Waiting for a rival to join…'} · voice chat
              works during the race (push-to-talk key: V).
            </p>
          </div>
          <RoomVoiceDock anchorClassName="!static !w-full sm:!w-72" />
        </div>
      )}
    </div>
  );
}
