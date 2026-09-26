'use client';

import React from 'react';
import { isCardPlayable } from '../engine/uno-cards-engine';
import { useUnoGame } from '../hooks/use-uno-game';
import { UnoCardView } from './UnoCardView';
import { UnoCenterTable } from './UnoCenterTable';
import { UnoHeader } from './UnoHeader';
import { GameOverModal, RulesModal, WildColorModal } from './UnoModals';
import { UnoOpponents } from './UnoOpponents';

export function UnoCardsGame() {
  const {
    playerCount,
    setPlayerCount,
    soundEnabled,
    setSoundEnabled,
    showRules,
    setShowRules,
    gameState,
    handleRestart,
    handlePlayerPlay,
    handlePlayerDraw,
    handlePlayerPass,
    handleCallLastCard,
    handleColorChoice,
  } = useUnoGame();

  const activePlayer = gameState.players[gameState.currentTurnIndex];
  const topDiscard = gameState.discardPile[gameState.discardPile.length - 1];
  const humanPlayer = gameState.players[0];

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-[#070b14] px-3 py-6 text-slate-100 sm:px-6">
      <UnoHeader
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((v) => !v)}
        onOpenRules={() => setShowRules(true)}
        onRestart={handleRestart}
        playerCount={playerCount}
        onSelectPlayerCount={setPlayerCount}
        lastActionMessage={gameState.lastActionMessage}
      />

      {/* Main Card Arena Felt Table */}
      <div className="relative flex w-full max-w-5xl flex-col items-center justify-between rounded-3xl border-4 border-slate-800 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0f1d38] via-[#091222] to-[#040812] p-4 sm:p-8 shadow-2xl shadow-black">
        {/* Opponents Section */}
        <UnoOpponents
          players={gameState.players}
          currentTurnIndex={gameState.currentTurnIndex}
          topDiscard={topDiscard}
        />

        {/* Center Arena */}
        <UnoCenterTable
          gameState={gameState}
          topDiscard={topDiscard}
          activePlayer={activePlayer}
          humanPlayer={humanPlayer}
          onDraw={handlePlayerDraw}
          onPass={handlePlayerPass}
          onCallLastCard={handleCallLastCard}
        />

        {/* Human Player Hand */}
        <div className="flex w-full flex-col items-center">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-300">
            <span>Your Hand ({humanPlayer.hand.length} cards)</span>
            {!activePlayer.isBot && (
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-400">
                Your Turn!
              </span>
            )}
          </div>

          <div className="flex max-w-full flex-wrap justify-center gap-2 p-2">
            {humanPlayer.hand.map((card) => {
              const playable =
                !activePlayer.isBot && isCardPlayable(card, topDiscard, gameState.activeColor);
              return (
                <div key={card.id}>
                  <UnoCardView
                    card={card}
                    isPlayable={playable}
                    onClick={() => handlePlayerPlay(card.id)}
                    size="md"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Wild Color Picker Modal */}
        {gameState.pendingWildPlayerId === humanPlayer.id && (
          <WildColorModal onSelectColor={handleColorChoice} />
        )}

        {/* Round / Game Over Victory Overlay */}
        <GameOverModal
          gameState={gameState}
          humanPlayerId={humanPlayer.id}
          onRestart={() => handleRestart()}
        />
      </div>

      {/* Rules Modal */}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  );
}
