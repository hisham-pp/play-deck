'use client';

import {
  ArrowLeft,
  Crown,
  Flame,
  Key,
  Map,
  Mountain,
  PackageOpen,
  RotateCcw,
  Shield,
  Star,
  Swords,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import {
  type ActiveEnemyState,
  type PlayerCombatAction,
  createActiveEnemy,
  processCombatTurn,
} from '../engine/enemies';
import {
  INITIAL_INVENTORY,
  type ItemDrop,
  type PlayerInventory,
  type Weapon,
  equipWeapon,
  generateDrops,
  getWeapon,
  processItemPickup,
} from '../engine/equipment';
import {
  CLIMBER_ACHIEVEMENTS,
  type LevelUpEvent,
  calculateStatsForLevel,
  evaluateXpGain,
  loadClimberProfile,
  saveClimberProfile,
} from '../engine/progression';
import {
  FIRST_FIVE_LEVELS,
  INITIAL_CLIMBER_PROGRESS,
  type LevelCompleteResult,
  type PlayerClimberProgress,
  completeLevel,
  getLevelConfig,
  isLevelUnlocked,
} from '../engine/stickman-climber-logic';
import { EnemyCombatStage } from './EnemyCombatStage';
import { LevelCompleteModal } from './LevelCompleteModal';
import { LevelMapScreen } from './LevelMapScreen';
import { LevelUpModal } from './LevelUpModal';
import { LootDropStage } from './LootDropStage';
import { PickupToastBanner } from './PickupToastBanner';
import { PlayerProgressionCard } from './PlayerProgressionCard';
import { WeaponLoadoutBar } from './WeaponLoadoutBar';

export function StickmanClimberGame() {
  const [viewMode, setViewMode] = useState<'stage' | 'map'>('stage');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [progress, setProgress] = useState<PlayerClimberProgress>(INITIAL_CLIMBER_PROGRESS);
  const [health, setHealth] = useState(100);
  const [xp, setXp] = useState(0);
  const [coins, setCoins] = useState(32);
  const [inventory, setInventory] = useState<PlayerInventory>(INITIAL_INVENTORY);
  const [activeEnemy, setActiveEnemy] = useState<ActiveEnemyState>(() => createActiveEnemy(1));
  const [paused, setPaused] = useState(false);
  const [activeVictory, setActiveVictory] = useState<LevelCompleteResult | null>(null);
  const [achievements, setAchievements] = useState<Record<string, { unlockedAt: string }>>({});

  // Progression & Level-Up State
  const [levelUpEvent, setLevelUpEvent] = useState<LevelUpEvent | null>(null);

  // Loot & Equipment Interaction State
  const [activeDrops, setActiveDrops] = useState<ItemDrop[]>([]);
  const [pickupNotification, setPickupNotification] = useState<string | null>(null);
  const [newWeaponCandidate, setNewWeaponCandidate] = useState<Weapon | null>(null);
  const [combatMessage, setCombatMessage] = useState<string | null>(null);

  const levelConfig = useMemo(() => getLevelConfig(selectedLevel), [selectedLevel]);
  const playerStats = useMemo(() => calculateStatsForLevel(xp), [xp]);
  const activeWeapon = useMemo(
    () => getWeapon(inventory.equippedWeaponId),
    [inventory.equippedWeaponId],
  );

  // Load persistent profile on mount
  useEffect(() => {
    async function initProfile() {
      const saved = await loadClimberProfile();
      if (saved) {
        setXp(saved.totalXp);
        setInventory({
          equippedWeaponId: saved.equippedWeaponId,
          storedWeapons: saved.storedWeapons,
          armorShield: 0,
          keys: 2,
        });
        setProgress((prev) => ({
          ...prev,
          unlockedLevels: saved.unlockedLevels,
        }));
        setAchievements(saved.achievements);
      }
    }
    void initProfile();
  }, []);

  // Set active enemy on level change
  useEffect(() => {
    setActiveEnemy(createActiveEnemy(selectedLevel));
  }, [selectedLevel]);

  // Auto-save persistent profile on significant state updates
  useEffect(() => {
    void saveClimberProfile({
      totalXp: xp,
      unlockedLevels: progress.unlockedLevels,
      bestScores: Object.fromEntries(
        Object.entries(progress.completedLevels).map(([k, v]) => [k, v.bestScore]),
      ),
      storedWeapons: inventory.storedWeapons,
      equippedWeaponId: inventory.equippedWeaponId,
      achievements,
      lastSaved: new Date().toISOString(),
    });
  }, [xp, progress, inventory.storedWeapons, inventory.equippedWeaponId, achievements]);

  const handleGainXp = (amount: number) => {
    const event = evaluateXpGain(xp, amount);
    setXp((prev) => prev + amount);

    if (event.didLevelUp) {
      setLevelUpEvent(event);
      setHealth(event.stats.maxHealth);
      if (event.newLevel >= 5 && !achievements['level_five']) {
        setAchievements((prev) => ({
          ...prev,
          level_five: { unlockedAt: new Date().toISOString() },
        }));
      }
    }
  };

  const handleStartLevelFromMap = (levelId: number) => {
    setSelectedLevel(levelId);
    setActiveEnemy(createActiveEnemy(levelId));
    setViewMode('stage');
    setActiveVictory(null);
    setActiveDrops([]);
    setCombatMessage(null);
  };

  const handleEquipWeapon = (weaponId: string) => {
    const updated = equipWeapon(inventory, weaponId);
    setInventory(updated);
    const weapon = getWeapon(weaponId);
    setPickupNotification(`Equipped ${weapon.name} (${weapon.damage} DMG)`);

    // Check achievement for arsenal
    if (updated.storedWeapons.length >= 3 && !achievements['arsenal_ready']) {
      setAchievements((prev) => ({
        ...prev,
        arsenal_ready: { unlockedAt: new Date().toISOString() },
      }));
    }
    if (weapon.id === 'legendary-sword' && !achievements['excalibur_wielder']) {
      setAchievements((prev) => ({
        ...prev,
        excalibur_wielder: { unlockedAt: new Date().toISOString() },
      }));
    }
  };

  const handleCollectDrop = (drop: ItemDrop) => {
    const result = processItemPickup({
      drop,
      currentHealth: health,
      currentShield: inventory.armorShield,
      currentCoins: coins,
      currentXp: xp,
      inventory,
    });

    setHealth(result.health);
    setCoins(result.coins);
    setInventory(result.inventory);
    setPickupNotification(result.notification);

    if (drop.xpAmount) {
      handleGainXp(drop.xpAmount);
    }

    if (result.newWeapon) {
      setNewWeaponCandidate(result.newWeapon);
    }

    setActiveDrops((prev) => prev.filter((d) => d.id !== drop.id));
  };

  const handleCollectAllDrops = () => {
    if (activeDrops.length === 0) return;

    let curHealth = health;
    let curShield = inventory.armorShield;
    let curCoins = coins;
    let curInv = inventory;
    let totalXpGained = 0;
    let foundWeapon: Weapon | undefined;

    for (const drop of activeDrops) {
      const res = processItemPickup({
        drop,
        currentHealth: curHealth,
        currentShield: curShield,
        currentCoins: curCoins,
        currentXp: xp,
        inventory: curInv,
      });
      curHealth = res.health;
      curShield = res.armorShield;
      curCoins = res.coins;
      curInv = res.inventory;
      if (drop.xpAmount) totalXpGained += drop.xpAmount;
      if (res.newWeapon) foundWeapon = res.newWeapon;
    }

    setHealth(curHealth);
    setCoins(curCoins);
    setInventory(curInv);
    setActiveDrops([]);
    setPickupNotification(
      foundWeapon ? `Acquired ${foundWeapon.name}!` : `Collected all ${activeDrops.length} items!`,
    );

    if (totalXpGained > 0) {
      handleGainXp(totalXpGained);
    }

    if (foundWeapon) {
      setNewWeaponCandidate(foundWeapon);
    }
  };

  const handleScavengeChest = () => {
    if (inventory.keys <= 0) {
      setPickupNotification('Requires 1 Dungeon Key to unlock!');
      return;
    }

    const updatedInv = { ...inventory, keys: inventory.keys - 1 };
    setInventory(updatedInv);

    const chestDrops = generateDrops('chest', selectedLevel);
    setActiveDrops((prev) => [...prev, ...chestDrops]);
    setPickupNotification('Unlocked cache chest with Dungeon Key!');
  };

  const handleTacticalAction = (action: PlayerCombatAction) => {
    if (paused || health <= 0) return;

    // Check weapon special ability trigger
    let abilityBonusDamage = 0;
    if (activeWeapon.specialAbility && Math.random() < activeWeapon.specialAbility.procChance) {
      const ability = activeWeapon.specialAbility;
      if (ability.bonusDamage) abilityBonusDamage += ability.bonusDamage;
      if (ability.multiplier) {
        abilityBonusDamage += Math.round(activeWeapon.damage * (ability.multiplier - 1));
      }
      if (ability.healAmount) {
        setHealth((h) => Math.min(playerStats.maxHealth, h + (ability.healAmount ?? 0)));
      }
    }

    // Weapon damage + player attack power bonus from progression leveling!
    const totalWeaponDamage = activeWeapon.damage + playerStats.attackBonus + abilityBonusDamage;

    const turnResult = processCombatTurn({
      playerAction: action,
      playerWeaponDamage: totalWeaponDamage,
      weaponType: activeWeapon.type,
      enemyState: activeEnemy,
    });

    setActiveEnemy(turnResult.enemyState);
    setCombatMessage(turnResult.actionMessage);

    if (turnResult.shieldBroken && !achievements['shield_smasher']) {
      setAchievements((prev) => ({
        ...prev,
        shield_smasher: { unlockedAt: new Date().toISOString() },
      }));
    }

    // Apply player health / shield delta with defense armor buffer
    if (turnResult.playerHealthDelta < 0) {
      // Incoming damage reduced by defense armor
      const rawIncoming = Math.max(
        1,
        Math.abs(turnResult.playerHealthDelta) - playerStats.defenseArmor,
      );
      if (inventory.armorShield > 0) {
        const absorbed = Math.min(inventory.armorShield, rawIncoming);
        const unabsorbed = rawIncoming - absorbed;
        setInventory((prev) => ({ ...prev, armorShield: prev.armorShield - absorbed }));
        setHealth((h) => Math.max(0, h - unabsorbed));
      } else {
        setHealth((h) => Math.max(0, h - rawIncoming));
      }
    }

    // Award XP per hit and check leveling
    const hitXp = Math.max(4, Math.round(turnResult.playerDamageDealt / 2));
    handleGainXp(hitXp);

    if (turnResult.enemyDefeated) {
      // Generate loot drops
      const dropSource =
        activeEnemy.definition.archetype === 'boss'
          ? 'boss'
          : activeEnemy.definition.shieldHp
            ? 'brute'
            : 'scout';
      const enemyDrops = generateDrops(dropSource, selectedLevel);
      setActiveDrops((prev) => [...prev, ...enemyDrops]);

      // Complete level and evaluate victory stars
      const score = Math.max(100, health * 10 + xp + activeEnemy.definition.rewardXp);
      const victory = completeLevel(selectedLevel, health, score, progress);
      setProgress(victory.progress);
      setActiveVictory(victory);

      // Award completion XP
      handleGainXp(victory.earnedXp);

      // Achievement checks
      if (selectedLevel === 1 && !achievements['first_ascent']) {
        setAchievements((prev) => ({
          ...prev,
          first_ascent: { unlockedAt: new Date().toISOString() },
        }));
      }
      if (selectedLevel === 5 && !achievements['summit_conqueror']) {
        setAchievements((prev) => ({
          ...prev,
          summit_conqueror: { unlockedAt: new Date().toISOString() },
        }));
      }

      // Offer reward weapon if unlocked from level completion
      if (victory.unlockedWeapon) {
        const weapon = getWeapon(victory.unlockedWeapon);
        setNewWeaponCandidate(weapon);
        const updatedInv = equipWeapon(inventory, weapon.id);
        setInventory(updatedInv);
      }
    }
  };

  const handleNextLevelFromModal = () => {
    if (selectedLevel < 5) {
      const next = selectedLevel + 1;
      setSelectedLevel(next);
      setHealth(playerStats.maxHealth);
      setActiveEnemy(createActiveEnemy(next));
      setActiveVictory(null);
      setActiveDrops([]);
      setCombatMessage(null);
      setViewMode('stage');
    } else {
      setActiveVictory(null);
      setViewMode('map');
    }
  };

  const handleReplay = () => {
    setHealth(playerStats.maxHealth);
    setActiveEnemy(createActiveEnemy(selectedLevel));
    setActiveVictory(null);
    setActiveDrops([]);
    setCombatMessage(null);
    setPaused(false);
    setViewMode('stage');
  };

  const handleRestart = () => {
    setHealth(playerStats.maxHealth);
    setActiveEnemy(createActiveEnemy(selectedLevel));
    setActiveVictory(null);
    setActiveDrops([]);
    setCombatMessage(null);
    setPaused(false);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 py-4">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-xs font-medium text-deck-500 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to catalog</span>
        </Link>
        <div className="flex items-center gap-3">
          {/* Map view toggle button */}
          <button
            onClick={() => setViewMode((m) => (m === 'stage' ? 'map' : 'stage'))}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'map'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-surface-raised border-surface-border text-deck-300 hover:text-white hover:border-amber-500/40'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>{viewMode === 'map' ? 'Return to Climb' : 'Ascent Map'}</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">
            <Swords className="h-3.5 w-3.5" />
            <span>Vertical Climber</span>
          </div>
        </div>
      </div>

      {/* Screen Mode: Ascent Map View */}
      {viewMode === 'map' ? (
        <LevelMapScreen
          progress={progress}
          selectedLevelId={selectedLevel}
          onSelectLevel={setSelectedLevel}
          onStartLevel={handleStartLevelFromMap}
          onClose={() => setViewMode('stage')}
        />
      ) : (
        /* Screen Mode: Active Climbing Stage */
        <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-3">
            <div className="rounded-2xl border border-surface-border bg-surface-raised p-3 shadow-arcade">
              {/* Level header bar */}
              <div className="mb-3 flex items-center justify-between rounded-xl border border-surface-border bg-surface-base/80 px-3 py-2">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-deck-500 flex items-center gap-1.5">
                    <span>Level {selectedLevel} of 5</span>
                    <span>•</span>
                    <span className="font-mono text-amber-400">{levelConfig.heightMeters}m</span>
                  </div>
                  <div className="text-lg font-black text-white flex items-center gap-2">
                    <span>{levelConfig.name}</span>
                    {levelConfig.isBossLevel && (
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-mono uppercase font-bold">
                        Boss Arena
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPaused((value) => !value)}
                    className="rounded-lg border border-surface-border bg-surface-overlay px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-deck-200 transition hover:border-amber-500 cursor-pointer"
                  >
                    {paused ? 'Resume' : 'Pause'}
                  </button>
                  <button
                    onClick={handleRestart}
                    className="rounded-lg bg-amber-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-950 transition hover:bg-amber-400 cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restart</span>
                  </button>
                </div>
              </div>

              {/* Climbing Arena Stage */}
              <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-[#111827]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_40%),linear-gradient(180deg,_rgba(17,24,39,0.4),_rgba(2,6,23,0.95))]" />
                <div className="relative h-[430px] w-full p-4">
                  {/* Top Stats Bar */}
                  <div className="absolute left-4 top-4 flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <Shield className="h-4 w-4" />
                      <span>
                        {health} / {playerStats.maxHealth} HP
                      </span>
                    </div>

                    {inventory.armorShield > 0 && (
                      <div className="flex items-center gap-1 rounded-md bg-sky-500/20 border border-sky-500/40 px-2 py-0.5 text-[10px] font-mono font-bold text-sky-300">
                        <Shield className="w-3 h-3" />
                        <span>+{inventory.armorShield} Shield</span>
                      </div>
                    )}
                  </div>

                  <div className="absolute right-4 top-4 flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                      <Zap className="h-4 w-4" />
                      <span>{coins} Coins</span>
                    </div>

                    <div className="flex items-center gap-1 rounded-md bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300">
                      <Key className="w-3 h-3" />
                      <span>{inventory.keys} Keys</span>
                    </div>
                  </div>

                  {/* Altitude / Height indicator */}
                  <div className="absolute left-1/2 top-4 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold">
                    <Mountain className="w-3.5 h-3.5 text-amber-400" />
                    <span>Altitude: {levelConfig.heightMeters}m</span>
                  </div>

                  {/* Combat Action Banner Message */}
                  {combatMessage && (
                    <div className="absolute left-1/2 top-14 -translate-x-1/2 z-30 animate-in fade-in zoom-in-95 duration-200 rounded-full border border-amber-400 bg-slate-950/90 px-4 py-1 text-xs font-mono font-bold text-amber-300 backdrop-blur-md flex items-center gap-1.5 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      <span>{combatMessage}</span>
                    </div>
                  )}

                  {/* Center Player Stickman Fighter */}
                  <div className="absolute left-1/3 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-500/50 bg-[#0f172a]/70 shadow-[0_0_40px_rgba(245,158,11,0.22)]" />

                  <div className="absolute left-1/3 top-[56%] -translate-x-1/2 -translate-y-1/2">
                    <div className="relative h-30 w-20">
                      <div className="absolute left-1/2 top-0 h-7 w-7 -translate-x-1/2 rounded-full border-4 border-slate-200 bg-slate-900 shadow-sm" />
                      <div className="absolute left-1/2 top-7 h-10 w-1 -translate-x-1/2 bg-slate-200" />
                      <div className="absolute left-[20%] top-11 h-8 w-1 rotate-45 bg-slate-200" />
                      <div className="absolute right-[20%] top-11 h-8 w-1 -rotate-45 bg-slate-200" />
                      <div className="absolute left-[38%] top-16 h-10 w-1 rotate-[26deg] bg-slate-200" />
                      <div className="absolute right-[38%] top-16 h-10 w-1 -rotate-[26deg] bg-slate-200" />
                    </div>
                  </div>

                  {/* Opponent Enemy Stage */}
                  <EnemyCombatStage enemyState={activeEnemy} />

                  {/* Active Loot Drops on Screen */}
                  <LootDropStage
                    drops={activeDrops}
                    onCollectDrop={handleCollectDrop}
                    onCollectAll={handleCollectAllDrops}
                  />

                  {/* Tactical Action Controls Bar */}
                  <div className="absolute bottom-4 inset-x-4 flex items-center justify-between gap-2">
                    <button
                      onClick={handleScavengeChest}
                      disabled={inventory.keys <= 0}
                      title="Unlock treasure cache with 1 Key"
                      className="rounded-xl border border-amber-500/40 bg-slate-900/90 hover:bg-slate-800 text-amber-300 px-3 py-2 text-xs font-bold transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                    >
                      <PackageOpen className="w-3.5 h-3.5" />
                      <span>Open Cache</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {/* Strike */}
                      <button
                        onClick={() => handleTacticalAction('strike')}
                        disabled={health <= 0}
                        className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                      >
                        Strike ({activeWeapon.damage + playerStats.attackBonus})
                      </button>

                      {/* Flank */}
                      <button
                        onClick={() => handleTacticalAction('flank')}
                        disabled={health <= 0}
                        title="Dodge telegraphed attacks and bypass shields"
                        className="rounded-xl border border-emerald-500/50 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                      >
                        Flank
                      </button>

                      {/* Cleave */}
                      <button
                        onClick={() => handleTacticalAction('cleave')}
                        disabled={health <= 0}
                        title="Heavy attack that smashes shields"
                        className="rounded-xl border border-sky-500/50 bg-sky-950/60 hover:bg-sky-900/80 text-sky-300 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                      >
                        Cleave
                      </button>

                      {/* Parry */}
                      <button
                        onClick={() => handleTacticalAction('parry')}
                        disabled={health <= 0}
                        title="Deflect and counter-stun"
                        className="rounded-xl border border-purple-500/50 bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                      >
                        Parry
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Weapon & Equipment Loadout Bar */}
            <WeaponLoadoutBar
              inventory={inventory}
              onEquipWeapon={handleEquipWeapon}
              disabled={paused}
            />
          </div>

          {/* Right Column: Player Progression Stats & Interactive Level Route */}
          <aside className="space-y-3">
            {/* Player Progression & Attributes Card */}
            <PlayerProgressionCard
              stats={playerStats}
              achievementCount={Object.keys(achievements).length}
              totalAchievements={Object.keys(CLIMBER_ACHIEVEMENTS).length}
            />

            {/* Ascent Route Progression */}
            <div className="rounded-2xl border border-surface-border bg-surface-raised p-3.5 shadow-arcade">
              <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-deck-500 font-mono">
                <span>Ascent Progression</span>
                <button
                  onClick={() => setViewMode('map')}
                  className="text-amber-500 hover:underline cursor-pointer"
                >
                  Full Map →
                </button>
              </div>
              <div className="space-y-1.5">
                {FIRST_FIVE_LEVELS.map((item) => {
                  const unlocked = isLevelUnlocked(item.id, progress.unlockedLevels);
                  const completion = progress.completedLevels[item.id];
                  const isCurrent = item.id === selectedLevel;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (unlocked) {
                          setSelectedLevel(item.id);
                          setActiveEnemy(createActiveEnemy(item.id));
                          setHealth(playerStats.maxHealth);
                          setActiveDrops([]);
                          setCombatMessage(null);
                        }
                      }}
                      disabled={!unlocked}
                      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition ${
                        isCurrent
                          ? 'border-amber-500 bg-amber-500/15 text-white shadow-sm'
                          : unlocked
                            ? 'border-surface-border bg-surface-base/80 text-deck-300 hover:border-amber-500/40 cursor-pointer'
                            : 'border-surface-border/40 bg-surface-base/30 text-deck-600 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {item.isBossLevel ? (
                          <Crown className="w-3.5 h-3.5 text-rose-400" />
                        ) : (
                          <span className="font-mono text-xs font-bold">{item.id}.</span>
                        )}
                        <span className="font-bold text-xs">{item.name}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {unlocked ? (
                          completion ? (
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3].map((starIdx) => (
                                <Star
                                  key={starIdx}
                                  className={`w-3 h-3 ${
                                    starIdx <= completion.stars
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-deck-600'
                                  }`}
                                />
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold">
                              Open
                            </span>
                          )
                        ) : (
                          <span className="text-[10px] font-mono text-deck-600 uppercase">
                            Locked
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Level Dossier Details */}
            <div className="rounded-xl border border-surface-border bg-surface-base/80 p-3 text-xs space-y-1.5">
              <div className="text-[10px] uppercase tracking-[0.2em] text-deck-500 font-mono">
                Level {selectedLevel} Briefing
              </div>
              <ul className="space-y-1 text-deck-300 text-xs">
                <li className="flex justify-between">
                  <span className="text-deck-500">Altitude:</span>
                  <span className="font-mono text-white">{levelConfig.heightMeters}m</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-deck-500">Hostiles:</span>
                  <span className="font-mono text-white">{levelConfig.enemyCount} Hostiles</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-deck-500">Environment:</span>
                  <span className="font-mono text-white capitalize">{levelConfig.theme}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-deck-500">Clear Reward:</span>
                  <span className="font-mono text-amber-400">+{levelConfig.rewardXp} XP</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      )}

      {/* Real-time Item Pickup & Weapon Comparison Toast */}
      <PickupToastBanner
        notification={pickupNotification}
        newWeaponCandidate={newWeaponCandidate}
        currentEquippedId={inventory.equippedWeaponId}
        onEquipCandidate={(id) => {
          handleEquipWeapon(id);
          setNewWeaponCandidate(null);
        }}
        onDismiss={() => {
          setPickupNotification(null);
          setNewWeaponCandidate(null);
        }}
      />

      {/* Level-Up Celebration Modal */}
      {levelUpEvent && (
        <LevelUpModal event={levelUpEvent} onDismiss={() => setLevelUpEvent(null)} />
      )}

      {/* Victory / Level Complete Modal */}
      {activeVictory && (
        <LevelCompleteModal
          result={activeVictory}
          onNextLevel={handleNextLevelFromModal}
          onReplay={handleReplay}
          onOpenMap={() => {
            setActiveVictory(null);
            setViewMode('map');
          }}
        />
      )}
    </div>
  );
}
