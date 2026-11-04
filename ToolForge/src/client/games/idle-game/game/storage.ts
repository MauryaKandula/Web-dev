import { GameState } from '../types.ts';
import { DEFAULT_GAME_STATE, INITIAL_GENERATORS, INITIAL_UPGRADES, INITIAL_ACHIEVEMENTS } from './constants.ts';

const SAVE_KEY = 'infinite_empire_save_v1';

export function saveGameState(state: GameState): boolean {
  try {
    const toSave: GameState = {
      ...state,
      lastSaveTimestamp: Date.now()
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
    return true;
  } catch (err) {
    console.error('Failed to save game state to localStorage', err);
    return false;
  }
}

export function loadGameState(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { ...DEFAULT_GAME_STATE };

    const parsed = JSON.parse(raw) as Partial<GameState>;

    // Merge generators
    const mergedGenerators = { ...INITIAL_GENERATORS };
    if (parsed.generators) {
      for (const id in parsed.generators) {
        if (mergedGenerators[id]) {
          mergedGenerators[id] = {
            ...mergedGenerators[id],
            count: Number(parsed.generators[id].count) || 0
          };
        }
      }
    }

    // Merge upgrades
    const mergedUpgrades = { ...INITIAL_UPGRADES };
    if (parsed.upgrades) {
      for (const id in parsed.upgrades) {
        if (mergedUpgrades[id]) {
          mergedUpgrades[id] = {
            ...mergedUpgrades[id],
            purchased: Boolean(parsed.upgrades[id].purchased)
          };
        }
      }
    }

    // Merge achievements
    const mergedAchievements = { ...INITIAL_ACHIEVEMENTS };
    if (parsed.achievements) {
      for (const id in parsed.achievements) {
        if (mergedAchievements[id]) {
          mergedAchievements[id] = {
            ...mergedAchievements[id],
            unlocked: Boolean(parsed.achievements[id].unlocked),
            unlockedAt: parsed.achievements[id].unlockedAt
          };
        }
      }
    }

    return {
      version: 1,
      credits: Math.max(0, Number(parsed.credits) || 0),
      totalLifetimeCredits: Math.max(0, Number(parsed.totalLifetimeCredits) || 0),
      antimatterCores: Math.max(0, Number(parsed.antimatterCores) || 0),
      coreMultiplierPercent: 2,
      overdriveEndTime: Number(parsed.overdriveEndTime) || 0,
      lastSaveTimestamp: Number(parsed.lastSaveTimestamp) || Date.now(),
      generators: mergedGenerators,
      upgrades: mergedUpgrades,
      achievements: mergedAchievements,
      stats: {
        manualClicks: Number(parsed.stats?.manualClicks) || 0,
        totalManualCredits: Number(parsed.stats?.totalManualCredits) || 0,
        timePlayedSeconds: Number(parsed.stats?.timePlayedSeconds) || 0,
        timesPrestiged: Number(parsed.stats?.timesPrestiged) || 0,
        peakCps: Number(parsed.stats?.peakCps) || 0,
        adBoostsClaimed: Number(parsed.stats?.adBoostsClaimed) || 0
      },
      soundEnabled: parsed.soundEnabled ?? true
    };
  } catch (err) {
    console.error('Failed to load game state from localStorage, falling back to default', err);
    return { ...DEFAULT_GAME_STATE };
  }
}

export function exportSaveString(state: GameState): string {
  const json = JSON.stringify(state);
  return btoa(encodeURIComponent(json));
}

export function importSaveString(saveString: string): GameState | null {
  try {
    const json = decodeURIComponent(atob(saveString.trim()));
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed.credits !== 'number') {
      return null;
    }
    localStorage.setItem(SAVE_KEY, json);
    return loadGameState();
  } catch (err) {
    console.error('Corrupt save string:', err);
    return null;
  }
}

export function resetGameState(): GameState {
  localStorage.removeItem(SAVE_KEY);
  return { ...DEFAULT_GAME_STATE, lastSaveTimestamp: Date.now() };
}
