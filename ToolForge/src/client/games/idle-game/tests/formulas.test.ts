import { describe, it, expect } from 'vitest';
import {
  calculateBulkCost,
  calculateMaxAffordable,
  calculateTotalCps,
  calculatePrestigeCores,
  calculateOfflineProgress,
  formatNumber,
  formatDuration
} from '../game/formulas.ts';
import { INITIAL_GENERATORS, INITIAL_UPGRADES } from '../game/constants.ts';

describe('Infinite Empire Economic & Idle Formulas', () => {
  it('calculates single and bulk purchase costs accurately', () => {
    const baseCost = 15;
    const r = 1.15;

    // First purchase (count 0)
    expect(calculateBulkCost(baseCost, 0, r, 1)).toBe(15);

    // Second purchase (count 1): floor(15 * 1.15^1) = 17
    expect(calculateBulkCost(baseCost, 1, r, 1)).toBe(17);

    // 10 units starting from count 0: sum of 15 * 1.15^k for k=0..9
    const cost10 = calculateBulkCost(baseCost, 0, r, 10);
    expect(cost10).toBeGreaterThan(150);
    expect(cost10).toBe(304);
  });

  it('calculates max affordable units and accurate total cost', () => {
    const baseCost = 15;
    const r = 1.15;
    const available = 500;

    const { quantity, totalCost } = calculateMaxAffordable(baseCost, 0, r, available);
    expect(quantity).toBeGreaterThan(0);
    expect(totalCost).toBeLessThanOrEqual(available);

    // Next unit would exceed available credits
    const costForOneMore = calculateBulkCost(baseCost, 0, r, quantity + 1);
    expect(costForOneMore).toBeGreaterThan(available);
  });

  it('calculates total CPS with base generators, specific upgrades, cores, and overdrive', () => {
    const testGens = {
      ...INITIAL_GENERATORS,
      gen_nanowire: { ...INITIAL_GENERATORS.gen_nanowire, count: 10 }, // 10 * 1 = 10 cps
      gen_conveyor: { ...INITIAL_GENERATORS.gen_conveyor, count: 5 }   // 5 * 8 = 40 cps
    };
    const testUpgrades = { ...INITIAL_UPGRADES };

    // Base CPS: 10 + 40 = 50 cps (no cores, no overdrive)
    let cps = calculateTotalCps(testGens, testUpgrades, 0, false);
    expect(cps).toBe(50);

    // Activate Nanowire 2x upgrade: 10*2 + 40 = 60 cps
    testUpgrades.up_nanowire_1 = { ...testUpgrades.up_nanowire_1, purchased: true };
    cps = calculateTotalCps(testGens, testUpgrades, 0, false);
    expect(cps).toBe(60);

    // Add 50 Antimatter Cores (+2% each -> 1 + 50*0.02 = 2.0x boost)
    cps = calculateTotalCps(testGens, testUpgrades, 50, false);
    expect(cps).toBe(120);

    // Activate Overdrive (2x) -> 120 * 2 = 240 cps
    cps = calculateTotalCps(testGens, testUpgrades, 50, true);
    expect(cps).toBe(240);
  });

  it('calculates prestige cores formula floor(150 * sqrt(totalCredits / 1e9))', () => {
    // Under 1 Billion credits -> 0 cores
    expect(calculatePrestigeCores(500_000_000)).toBe(0);

    // Exactly 1 Billion credits -> floor(150 * sqrt(1)) = 150 cores
    expect(calculatePrestigeCores(1_000_000_000)).toBe(150);

    // 4 Billion credits -> floor(150 * sqrt(4)) = 300 cores
    expect(calculatePrestigeCores(4_000_000_000)).toBe(300);

    // 9 Billion credits -> floor(150 * sqrt(9)) = 450 cores
    expect(calculatePrestigeCores(9_000_000_000)).toBe(450);
  });

  it('simulates offline progress with 24h cap and ignores sub-10s intervals', () => {
    const cps = 100;
    const now = 1000000;

    // Less than 10 seconds away -> 0 earnings
    const quick = calculateOfflineProgress(now - 5000, now, cps);
    expect(quick.elapsedSeconds).toBe(0);
    expect(quick.creditsEarned).toBe(0);

    // 1 hour away (3600s) -> 360,000 credits
    const oneHour = calculateOfflineProgress(now - 3600 * 1000, now, cps);
    expect(oneHour.elapsedSeconds).toBe(3600);
    expect(oneHour.creditsEarned).toBe(360000);

    // 48 hours away -> capped at 24 hours (86,400s)
    const longAway = calculateOfflineProgress(now - 48 * 3600 * 1000, now, cps);
    expect(longAway.elapsedSeconds).toBe(86400);
    expect(longAway.creditsEarned).toBe(86400 * 100);
  });

  it('formats large sci-fi numbers cleanly with suffixes', () => {
    expect(formatNumber(500)).toBe('500');
    expect(formatNumber(1250)).toBe('1.25 K');
    expect(formatNumber(3450000)).toBe('3.45 M');
    expect(formatNumber(1500000000)).toBe('1.50 B');
    expect(formatNumber(7890000000000)).toBe('7.89 T');
    expect(formatNumber(1e15)).toBe('1.00 Qa');
    expect(formatNumber(1e18)).toBe('1.00 Qi');
  });

  it('formats duration in human-readable strings', () => {
    expect(formatDuration(45)).toBe('45s');
    expect(formatDuration(125)).toBe('2m 5s');
    expect(formatDuration(3665)).toBe('1h 1m 5s');
    expect(formatDuration(90000)).toBe('1d 1h 0m');
  });
});
