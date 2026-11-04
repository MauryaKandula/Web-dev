export type FighterState =
  | 'IDLE'
  | 'WALK'
  | 'JUMP'
  | 'CROUCH'
  | 'ATTACK_PUNCH'
  | 'ATTACK_KICK'
  | 'ATTACK_SPECIAL'
  | 'ATTACK_SUPER'
  | 'BLOCK'
  | 'HITSTUN'
  | 'KO';

export type CpuDifficulty = 'easy' | 'medium' | 'hard';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Hitbox extends BoundingBox {
  damage: number;
  knockbackX: number;
  knockbackY: number;
  hitstun: number; // frames
  isSuper?: boolean;
}

export interface CharacterStats {
  speed: number;    // 1-10
  power: number;    // 1-10
  defense: number;  // 1-10
}

export interface CharacterDef {
  id: string;
  name: string;
  title: string;
  archetype: string;
  color: string;
  accentColor: string;
  stats: CharacterStats;
  specialMoveName: string;
  superMoveName: string;
  bio: string;
  victoryQuote: string;
}

export interface StageDef {
  id: string;
  name: string;
  subtitle: string;
  groundY: number;
  primaryColor: string;
  accentColor: string;
}

export interface MatchRoundState {
  roundNumber: number;
  p1Wins: number;
  p2Wins: number;
  timeLeft: number;
  winner: 1 | 2 | 'draw' | null;
}
