import { describe, it, expect } from 'vitest';
import { Fighter } from '../game/fighter.ts';
import { CHARACTERS } from '../game/characters.ts';

describe('Anime Clash Arena Fighter State Machine', () => {
  const rinChar = CHARACTERS[0];

  it('initializes fighter with full health and zero super meter', () => {
    const fighter = new Fighter(rinChar, true, 200, 420);

    expect(fighter.health).toBe(100);
    expect(fighter.superMeter).toBe(0);
    expect(fighter.state).toBe('IDLE');
    expect(fighter.facing).toBe(1);
  });

  it('transitions to attack states on punch and kick', () => {
    const fighter = new Fighter(rinChar, true, 200, 420);

    expect(fighter.punch()).toBe(true);
    expect(fighter.state).toBe('ATTACK_PUNCH');

    // Cannot attack again while mid-attack
    expect(fighter.kick()).toBe(false);
  });

  it('rejects Super Attack if meter is below 100%', () => {
    const fighter = new Fighter(rinChar, true, 200, 420);
    fighter.superMeter = 50;

    expect(fighter.superAttack()).toBe(false);
    expect(fighter.state).toBe('IDLE');

    // When meter reaches 100%, super executes and resets meter
    fighter.superMeter = 100;
    expect(fighter.superAttack()).toBe(true);
    expect(fighter.state).toBe('ATTACK_SUPER');
    expect(fighter.superMeter).toBe(0);
  });

  it('transitions to KO state when health drops to 0', () => {
    const fighter = new Fighter(rinChar, true, 200, 420);
    const superHitbox = {
      x: 0,
      y: 0,
      width: 50,
      height: 50,
      damage: 100,
      knockbackX: 10,
      knockbackY: -8,
      hitstun: 30
    };

    fighter.takeHit(superHitbox, 100, false);
    expect(fighter.health).toBe(0);
    expect(fighter.state).toBe('KO');
  });
});
