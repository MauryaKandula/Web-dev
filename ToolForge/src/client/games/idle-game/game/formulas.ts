import { Generator, Upgrade } from '../types.ts';

/**
 * Calculates the exact cost to purchase N units of a generator starting from current count.
 */
export function calculateBulkCost(
  baseCost: number,
  currentCount: number,
  costMultiplier: number,
  quantityToBuy: number
): number {
  if (quantityToBuy <= 0) return 0;
  if (quantityToBuy === 1) {
    return Math.floor(baseCost * Math.pow(costMultiplier, currentCount));
  }

  // Geometric series sum: base * r^count * (r^N - 1) / (r - 1)
  const r = costMultiplier;
  const firstTerm = baseCost * Math.pow(r, currentCount);
  const total = firstTerm * (Math.pow(r, quantityToBuy) - 1) / (r - 1);
  return Math.floor(total);
}

/**
 * Calculates the maximum units of a generator that can be afforded with current credits.
 */
export function calculateMaxAffordable(
  baseCost: number,
  currentCount: number,
  costMultiplier: number,
  availableCredits: number
): { quantity: number; totalCost: number } {
  if (availableCredits < baseCost * Math.pow(costMultiplier, currentCount)) {
    return { quantity: 0, totalCost: 0 };
  }

  const r = costMultiplier;
  const firstTerm = baseCost * Math.pow(r, currentCount);
  // availableCredits = firstTerm * (r^N - 1) / (r - 1)
  // r^N = 1 + (availableCredits * (r - 1) / firstTerm)
  const n = Math.floor(Math.log(1 + (availableCredits * (r - 1)) / firstTerm) / Math.log(r));
  const quantity = Math.max(0, n);
  const totalCost = calculateBulkCost(baseCost, currentCount, costMultiplier, quantity);

  return { quantity, totalCost };
}

/**
 * Calculates real-time Credits Per Second (CPS).
 */
export function calculateTotalCps(
  generators: Record<string, Generator>,
  upgrades: Record<string, Upgrade>,
  antimatterCores: number,
  isOverdriveActive: boolean
): number {
  let baseSum = 0;

  // Calculate each generator's output with its specific upgrades
  for (const genId in generators) {
    const gen = generators[genId];
    if (gen.count <= 0) continue;

    let multiplier = 1;
    for (const upId in upgrades) {
      const up = upgrades[upId];
      if (up.purchased && up.targetGeneratorId === genId) {
        multiplier *= up.multiplier;
      }
    }

    baseSum += gen.baseCps * gen.count * multiplier;
  }

  // Apply Global Upgrades
  for (const upId in upgrades) {
    const up = upgrades[upId];
    if (up.purchased && !up.targetGeneratorId) {
      baseSum *= up.multiplier;
    }
  }

  // Apply Antimatter Prestige Cores (+2% per core)
  const coreBonus = 1 + (antimatterCores * 0.02);
  let total = baseSum * coreBonus;

  // Apply Overdrive 2x boost if active
  if (isOverdriveActive) {
    total *= 2;
  }

  return Math.round(total * 100) / 100;
}

/**
 * Calculates Antimatter Cores earned from Quantum Transcendence.
 * Formula: floor( 150 * sqrt( totalLifetimeCredits / 1e9 ) )
 */
export function calculatePrestigeCores(totalLifetimeCredits: number): number {
  if (totalLifetimeCredits < 1e9) return 0;
  return Math.floor(150 * Math.sqrt(totalLifetimeCredits / 1e9));
}

/**
 * Simulates offline idle earnings (capped at 24 hours).
 */
export function calculateOfflineProgress(
  lastSaveTimestamp: number,
  currentTimestamp: number,
  currentCps: number
): { elapsedSeconds: number; creditsEarned: number } {
  if (!lastSaveTimestamp || currentTimestamp <= lastSaveTimestamp) {
    return { elapsedSeconds: 0, creditsEarned: 0 };
  }

  const rawElapsed = (currentTimestamp - lastSaveTimestamp) / 1000;
  // Minimum 10 seconds away to trigger modal, capped at 86,400 seconds (24h)
  if (rawElapsed < 10) {
    return { elapsedSeconds: 0, creditsEarned: 0 };
  }

  const elapsedSeconds = Math.min(rawElapsed, 86400);
  const creditsEarned = Math.floor(elapsedSeconds * currentCps);

  return { elapsedSeconds: Math.floor(elapsedSeconds), creditsEarned };
}

/**
 * High-precision sci-fi number formatter (K, M, B, T, Qa, Qi, Sx, Sp, Oc, No, Dc)
 */
export function formatNumber(num: number): string {
  if (!Number.isFinite(num)) return 'Infinity';
  if (num < 1000) return num.toLocaleString('en-US', { maximumFractionDigits: 1 });

  const suffixes = [
    '', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc',
    'UDc', 'DDc', 'TDc', 'QaDc', 'QiDc', 'SxDc', 'SpDc', 'OcDc', 'NoDc', 'Vg'
  ];

  const tier = Math.floor(Math.log10(Math.abs(num)) / 3);
  if (tier < suffixes.length) {
    const scale = Math.pow(10, tier * 3);
    const scaled = num / scale;
    return `${scaled.toFixed(2)} ${suffixes[tier]}`;
  }

  // Scientific notation fallback for numbers >= 1e66
  return num.toExponential(2);
}

/**
 * Formats duration in seconds into human-readable HH:MM:SS or DD:HH:MM
 */
export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '0s';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 24) {
    const days = Math.floor(hrs / 24);
    const remHrs = hrs % 24;
    return `${days}d ${remHrs}h ${mins}m`;
  }
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}
