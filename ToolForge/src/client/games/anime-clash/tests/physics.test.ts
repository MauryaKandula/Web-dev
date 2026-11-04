import { describe, it, expect } from 'vitest';
import { checkAABBCollision, calculateDamage, clampPosition } from '../game/physics.ts';

describe('Anime Clash Arena Physics Engine', () => {
  it('correctly detects overlapping bounding boxes', () => {
    const boxA = { x: 100, y: 100, width: 50, height: 50 };
    const boxB = { x: 130, y: 120, width: 40, height: 40 };

    expect(checkAABBCollision(boxA, boxB)).toBe(true);
  });

  it('correctly reports non-overlapping bounding boxes', () => {
    const boxA = { x: 100, y: 100, width: 50, height: 50 };
    const boxB = { x: 200, y: 100, width: 50, height: 50 };

    expect(checkAABBCollision(boxA, boxB)).toBe(false);
  });

  it('calculates full damage on unblocked hits', () => {
    const raw = 20;
    const { finalDamage, wasBlocked } = calculateDamage(raw, false, 5);

    expect(wasBlocked).toBe(false);
    expect(finalDamage).toBeGreaterThan(15);
    expect(finalDamage).toBeLessThanOrEqual(raw);
  });

  it('applies 75% damage reduction when blocking', () => {
    const raw = 20;
    const { finalDamage, wasBlocked } = calculateDamage(raw, true, 5);

    expect(wasBlocked).toBe(true);
    expect(finalDamage).toBeLessThanOrEqual(6);
  });

  it('clamps fighter coordinates within arena stage borders', () => {
    expect(clampPosition(-10, 50, 0, 960)).toBe(0);
    expect(clampPosition(950, 50, 0, 960)).toBe(910);
    expect(clampPosition(400, 50, 0, 960)).toBe(400);
  });
});
