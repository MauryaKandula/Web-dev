import { BoundingBox } from '../types.ts';

/**
 * Axis-Aligned Bounding Box (AABB) intersection check.
 */
export function checkAABBCollision(boxA: BoundingBox, boxB: BoundingBox): boolean {
  return (
    boxA.x < boxB.x + boxB.width &&
    boxA.x + boxA.width > boxB.x &&
    boxA.y < boxB.y + boxB.height &&
    boxA.y + boxA.height > boxB.y
  );
}

/**
 * Calculates net damage applied to target after defense and block attenuation.
 */
export function calculateDamage(
  rawDamage: number,
  isBlocking: boolean,
  targetDefense: number
): { finalDamage: number; wasBlocked: boolean } {
  // Defense stat attenuates damage: 1 defense = 0% reduction, 10 defense = 25% reduction
  const defenseMultiplier = Math.max(0.75, 1 - (targetDefense - 1) * 0.027);
  let damage = rawDamage * defenseMultiplier;

  if (isBlocking) {
    // 75% chip damage absorption
    damage *= 0.25;
    return {
      finalDamage: Math.max(1, Math.round(damage)),
      wasBlocked: true
    };
  }

  return {
    finalDamage: Math.max(1, Math.round(damage)),
    wasBlocked: false
  };
}

/**
 * Clamps fighter position within arena stage boundaries.
 */
export function clampPosition(x: number, width: number, minX: number, maxX: number): number {
  if (x < minX) return minX;
  if (x + width > maxX) return maxX - width;
  return x;
}
