export interface Generator {
  id: string;
  name: string;
  tier: number; // 1 to 7
  tierName: string;
  baseCost: number;
  baseCps: number; // credits per second per unit
  costMultiplier: number; // default 1.15
  count: number;
  description: string;
  lore: string;
}

export interface Upgrade {
  id: string;
  name: string;
  cost: number;
  multiplier: number;
  targetGeneratorId?: string; // specific generator ID or undefined for global
  purchased: boolean;
  description: string;
  lore?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: number;
  icon: string;
}

export interface GameStats {
  manualClicks: number;
  totalManualCredits: number;
  timePlayedSeconds: number;
  timesPrestiged: number;
  peakCps: number;
  adBoostsClaimed: number;
}

export interface GameState {
  version: number;
  credits: number;
  totalLifetimeCredits: number;
  antimatterCores: number;
  coreMultiplierPercent: number; // e.g. 2% per core
  overdriveEndTime: number; // timestamp in ms
  lastSaveTimestamp: number;
  generators: Record<string, Generator>;
  upgrades: Record<string, Upgrade>;
  achievements: Record<string, Achievement>;
  stats: GameStats;
  soundEnabled: boolean;
}
