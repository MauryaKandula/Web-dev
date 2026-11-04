import { describe, it, expect } from 'vitest';
import { Fighter } from '../game/fighter.ts';
import { CpuController } from '../game/ai.ts';
import { CHARACTERS } from '../game/characters.ts';

describe('Anime Clash Arena CPU AI Controller', () => {
  it('correctly aligns CPU facing direction toward opponent', () => {
    const cpu = new Fighter(CHARACTERS[1], false, 600, 420);
    const player = new Fighter(CHARACTERS[0], true, 200, 420);
    const ai = new CpuController('medium');

    ai.update(cpu, player);
    // Player is to the left (200 < 600), so CPU should face left (-1)
    expect(cpu.facing).toBe(-1);

    // Swap positions
    cpu.x = 100;
    ai.update(cpu, player);
    // Player is to the right (200 > 100), so CPU should face right (1)
    expect(cpu.facing).toBe(1);
  });
});
