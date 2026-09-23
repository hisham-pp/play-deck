const ENEMY_TEMPLATES = {
    1: { name: 'Rookie Scout', hp: 18, rewardXp: 18, rewardCoins: 4 },
    2: { name: 'Dust Fang', hp: 28, rewardXp: 28, rewardCoins: 6 },
    3: { name: 'Stone Brute', hp: 38, rewardXp: 36, rewardCoins: 8 },
    4: { name: 'Ash Warden', hp: 52, rewardXp: 48, rewardCoins: 12 },
    5: { name: 'Summit Titan', hp: 72, rewardXp: 60, rewardCoins: 15 },
} as const;

const WEAPON_DAMAGE: Record<string, number> = {
    'Wooden Sword': 12,
    'Iron Blade': 18,
    Katana: 24,
};

export function createEnemyWave(level: number) {
    const safeLevel = Math.min(Math.max(1, level), 5);
    const enemy = ENEMY_TEMPLATES[safeLevel as keyof typeof ENEMY_TEMPLATES];

    return {
        level: safeLevel,
        enemy: { ...enemy },
    };
}

export function resolveCombat({
    weapon,
    level,
    health,
    xp,
    coins,
    enemyHp,
}: {
    weapon: keyof typeof WEAPON_DAMAGE | string;
    level: number;
    health: number;
    xp: number;
    coins: number;
    enemyHp: number;
}) {
    const safeLevel = Math.min(Math.max(1, level), 5);
    const wave = createEnemyWave(safeLevel);
    const damage = WEAPON_DAMAGE[weapon] ?? 10;
    const remainingEnemyHp = Math.max(0, enemyHp - damage);
    const remainingHealth = Math.max(0, health - Math.max(2, Math.ceil(wave.enemy.hp / 8)));
    const gainedXp = Math.max(0, wave.enemy.rewardXp + Math.floor((damage - 10) / 2));
    const gainedCoins = Math.max(0, wave.enemy.rewardCoins + Math.max(0, damage - 10));

    return {
        level: safeLevel,
        weapon,
        damage,
        health: remainingHealth,
        xp: xp + gainedXp,
        coins: coins + gainedCoins,
        enemyHp: remainingEnemyHp,
        defeated: remainingEnemyHp === 0,
    };
}
