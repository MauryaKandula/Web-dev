import { Fighter } from './fighter.ts';
import { CpuDifficulty } from '../types.ts';

export class CpuController {
  private difficulty: CpuDifficulty;
  private actionCooldown: number = 0;

  constructor(difficulty: CpuDifficulty = 'medium') {
    this.difficulty = difficulty;
  }

  public setDifficulty(diff: CpuDifficulty) {
    this.difficulty = diff;
  }

  public update(cpu: Fighter, opponent: Fighter) {
    if (cpu.state === 'KO' || cpu.state === 'HITSTUN') return;

    // Face the opponent
    cpu.facing = cpu.x < opponent.x ? 1 : -1;

    const dist = Math.abs(cpu.x - opponent.x);
    this.actionCooldown--;

    if (this.difficulty === 'hard') {
      this.updateHard(cpu, opponent, dist);
    } else if (this.difficulty === 'medium') {
      this.updateMedium(cpu, opponent, dist);
    } else {
      this.updateEasy(cpu, opponent, dist);
    }
  }

  private updateHard(cpu: Fighter, opp: Fighter, dist: number) {
    // 1. Reactive Defensive Blocking
    if (opp.activeHitbox && dist < 120 && Math.random() < 0.85) {
      cpu.block();
      return;
    } else {
      cpu.stopBlock();
    }

    // 2. Super Punish
    if (cpu.superMeter >= 100 && dist < 140) {
      cpu.superAttack();
      return;
    }

    // 3. Close Range Attack Combos
    if (dist < 75) {
      if (Math.random() < 0.45) {
        cpu.punch();
      } else if (Math.random() < 0.35) {
        cpu.kick();
      } else {
        cpu.special();
      }
      return;
    }

    // 4. Mid Range Specials
    if (dist >= 75 && dist < 180) {
      if (Math.random() < 0.35) {
        cpu.special();
        return;
      }
      if (Math.random() < 0.25) {
        cpu.jump();
      }
    }

    // 5. Spacing Navigation
    if (dist >= 70) {
      cpu.move(cpu.facing);
    } else {
      cpu.stopWalk();
    }
  }

  private updateMedium(cpu: Fighter, opp: Fighter, dist: number) {
    // Occasional block
    if (opp.activeHitbox && dist < 100 && Math.random() < 0.45) {
      cpu.block();
      return;
    } else {
      cpu.stopBlock();
    }

    // Super usage
    if (cpu.superMeter >= 100 && dist < 120 && Math.random() < 0.5) {
      cpu.superAttack();
      return;
    }

    // Attacks
    if (dist < 80 && this.actionCooldown <= 0) {
      this.actionCooldown = 15;
      const roll = Math.random();
      if (roll < 0.5) cpu.punch();
      else if (roll < 0.8) cpu.kick();
      else cpu.special();
      return;
    }

    // Advance
    if (dist >= 75) {
      cpu.move(cpu.facing);
    } else {
      cpu.stopWalk();
    }
  }

  private updateEasy(cpu: Fighter, _opp: Fighter, dist: number) {
    cpu.stopBlock();

    if (dist < 75 && Math.random() < 0.18) {
      if (Math.random() < 0.6) cpu.punch();
      else cpu.kick();
      return;
    }

    if (dist >= 80) {
      if (Math.random() < 0.7) {
        cpu.move(cpu.facing);
      } else {
        cpu.stopWalk();
      }
    } else {
      cpu.stopWalk();
    }
  }
}
