import { CharacterDef, FighterState, Hitbox, BoundingBox } from '../types.ts';
import { clampPosition } from './physics.ts';

export class Fighter {
  public charDef: CharacterDef;
  public isPlayer1: boolean;

  // Transform
  public x: number;
  public y: number;
  public vx: number = 0;
  public vy: number = 0;
  public width: number = 55;
  public height: number = 110;
  public facing: 1 | -1 = 1; // 1 = right, -1 = left

  // Combat Stats
  public health: number = 100;
  public maxHealth: number = 100;
  public superMeter: number = 0; // 0 to 100
  public state: FighterState = 'IDLE';
  public stateFrame: number = 0;
  public isGrounded: boolean = true;
  public hitstunFrames: number = 0;

  // Active Hitbox generated during attack
  public activeHitbox: Hitbox | null = null;
  public hasHitCurrentAttack: boolean = false;

  // Visual Effects
  public sparks: { x: number; y: number; color: string; life: number }[] = [];

  constructor(charDef: CharacterDef, isPlayer1: boolean, startX: number, groundY: number) {
    this.charDef = charDef;
    this.isPlayer1 = isPlayer1;
    this.x = startX;
    this.y = groundY - this.height;
    this.facing = isPlayer1 ? 1 : -1;
  }

  public reset(startX: number, groundY: number) {
    this.health = this.maxHealth;
    this.superMeter = 0;
    this.state = 'IDLE';
    this.stateFrame = 0;
    this.vx = 0;
    this.vy = 0;
    this.x = startX;
    this.y = groundY - this.height;
    this.isGrounded = true;
    this.hitstunFrames = 0;
    this.activeHitbox = null;
    this.hasHitCurrentAttack = false;
    this.facing = this.isPlayer1 ? 1 : -1;
  }

  public getHurtbox(): BoundingBox {
    if (this.state === 'CROUCH') {
      return {
        x: this.x,
        y: this.y + 40,
        width: this.width,
        height: this.height - 40
      };
    }
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }

  public update(groundY: number, stageWidth: number) {
    this.stateFrame++;

    // Sparks decay
    this.sparks = this.sparks
      .map((s) => ({ ...s, life: s.life - 1 }))
      .filter((s) => s.life > 0);

    // Hitstun recovery
    if (this.state === 'HITSTUN') {
      this.hitstunFrames--;
      if (this.hitstunFrames <= 0) {
        this.state = 'IDLE';
        this.stateFrame = 0;
      }
    }

    // Apply Physics & Gravity
    const gravity = 0.85;
    this.vy += gravity;
    this.x += this.vx;
    this.y += this.vy;

    // Ground Collision
    if (this.y + this.height >= groundY) {
      this.y = groundY - this.height;
      this.vy = 0;
      this.isGrounded = true;
      if (this.state === 'JUMP') {
        this.state = 'IDLE';
        this.stateFrame = 0;
      }
    } else {
      this.isGrounded = false;
    }

    // Ground Friction
    if (this.isGrounded) {
      this.vx *= 0.82;
      if (Math.abs(this.vx) < 0.2) this.vx = 0;
    }

    // Arena Boundary Clamp
    this.x = clampPosition(this.x, this.width, 30, stageWidth - 30);

    // Attack State Frame Progression & Hitbox Timing
    this.updateAttackFrames();
  }

  private updateAttackFrames() {
    if (this.state === 'ATTACK_PUNCH') {
      if (this.stateFrame >= 4 && this.stateFrame <= 8 && !this.hasHitCurrentAttack) {
        this.activeHitbox = {
          x: this.facing === 1 ? this.x + this.width - 5 : this.x - 35,
          y: this.y + 25,
          width: 40,
          height: 25,
          damage: 8 + Math.round(this.charDef.stats.power * 0.5),
          knockbackX: this.facing * 4,
          knockbackY: -2,
          hitstun: 14
        };
      } else {
        this.activeHitbox = null;
      }
      if (this.stateFrame > 15) {
        this.state = 'IDLE';
        this.stateFrame = 0;
        this.hasHitCurrentAttack = false;
      }
    } else if (this.state === 'ATTACK_KICK') {
      if (this.stateFrame >= 6 && this.stateFrame <= 12 && !this.hasHitCurrentAttack) {
        this.activeHitbox = {
          x: this.facing === 1 ? this.x + this.width - 5 : this.x - 45,
          y: this.y + 45,
          width: 50,
          height: 30,
          damage: 13 + Math.round(this.charDef.stats.power * 0.7),
          knockbackX: this.facing * 7,
          knockbackY: -4,
          hitstun: 20
        };
      } else {
        this.activeHitbox = null;
      }
      if (this.stateFrame > 22) {
        this.state = 'IDLE';
        this.stateFrame = 0;
        this.hasHitCurrentAttack = false;
      }
    } else if (this.state === 'ATTACK_SPECIAL') {
      if (this.stateFrame >= 8 && this.stateFrame <= 18 && !this.hasHitCurrentAttack) {
        this.activeHitbox = {
          x: this.facing === 1 ? this.x + this.width : this.x - 70,
          y: this.y + 15,
          width: 70,
          height: 55,
          damage: 20 + Math.round(this.charDef.stats.power * 1.0),
          knockbackX: this.facing * 11,
          knockbackY: -6,
          hitstun: 26
        };
      } else {
        this.activeHitbox = null;
      }
      if (this.stateFrame > 32) {
        this.state = 'IDLE';
        this.stateFrame = 0;
        this.hasHitCurrentAttack = false;
      }
    } else if (this.state === 'ATTACK_SUPER') {
      if (this.stateFrame >= 10 && this.stateFrame <= 26 && !this.hasHitCurrentAttack) {
        this.activeHitbox = {
          x: this.facing === 1 ? this.x + 10 : this.x - 120,
          y: this.y - 10,
          width: 140,
          height: 100,
          damage: 38 + Math.round(this.charDef.stats.power * 1.5),
          knockbackX: this.facing * 16,
          knockbackY: -9,
          hitstun: 38,
          isSuper: true
        };
      } else {
        this.activeHitbox = null;
      }
      if (this.stateFrame > 45) {
        this.state = 'IDLE';
        this.stateFrame = 0;
        this.hasHitCurrentAttack = false;
      }
    }
  }

  // Action Triggers
  public move(dir: 1 | -1) {
    if (this.state !== 'IDLE' && this.state !== 'WALK') return;
    const baseSpeed = 4 + (this.charDef.stats.speed * 0.4);
    this.vx = dir * baseSpeed;
    this.state = 'WALK';
  }

  public stopWalk() {
    if (this.state === 'WALK') {
      this.state = 'IDLE';
    }
  }

  public jump() {
    if (!this.isGrounded) return;
    if (['HITSTUN', 'KO', 'ATTACK_SUPER'].includes(this.state)) return;
    this.vy = -16.5;
    this.isGrounded = false;
    this.state = 'JUMP';
    this.stateFrame = 0;
  }

  public crouch() {
    if (!this.isGrounded) return;
    if (['HITSTUN', 'KO', 'ATTACK_PUNCH', 'ATTACK_KICK', 'ATTACK_SPECIAL', 'ATTACK_SUPER'].includes(this.state)) return;
    this.state = 'CROUCH';
    this.vx = 0;
  }

  public stopCrouch() {
    if (this.state === 'CROUCH') {
      this.state = 'IDLE';
    }
  }

  public block() {
    if (!this.isGrounded) return;
    if (['HITSTUN', 'KO', 'ATTACK_PUNCH', 'ATTACK_KICK', 'ATTACK_SPECIAL', 'ATTACK_SUPER'].includes(this.state)) return;
    this.state = 'BLOCK';
    this.vx = 0;
  }

  public stopBlock() {
    if (this.state === 'BLOCK') {
      this.state = 'IDLE';
    }
  }

  public punch(): boolean {
    if (!this.canAttack()) return false;
    this.state = 'ATTACK_PUNCH';
    this.stateFrame = 0;
    this.hasHitCurrentAttack = false;
    return true;
  }

  public kick(): boolean {
    if (!this.canAttack()) return false;
    this.state = 'ATTACK_KICK';
    this.stateFrame = 0;
    this.hasHitCurrentAttack = false;
    return true;
  }

  public special(): boolean {
    if (!this.canAttack()) return false;
    this.state = 'ATTACK_SPECIAL';
    this.stateFrame = 0;
    this.hasHitCurrentAttack = false;
    return true;
  }

  public superAttack(): boolean {
    if (!this.canAttack() || this.superMeter < 100) return false;
    this.superMeter = 0;
    this.state = 'ATTACK_SUPER';
    this.stateFrame = 0;
    this.hasHitCurrentAttack = false;
    return true;
  }

  private canAttack(): boolean {
    return ['IDLE', 'WALK'].includes(this.state);
  }

  public takeHit(hitbox: Hitbox, damage: number, wasBlocked: boolean) {
    this.health = Math.max(0, this.health - damage);

    // Charge super meter on dealing and taking damage
    this.superMeter = Math.min(100, this.superMeter + (wasBlocked ? 6 : 14));

    // Spawn Impact Sparks
    for (let i = 0; i < (wasBlocked ? 5 : 12); i++) {
      this.sparks.push({
        x: this.x + this.width / 2 + (Math.random() - 0.5) * 30,
        y: this.y + this.height / 2 + (Math.random() - 0.5) * 40,
        color: wasBlocked ? '#38bdf8' : hitbox.isSuper ? '#ec4899' : '#f59e0b',
        life: 12 + Math.floor(Math.random() * 8)
      });
    }

    if (this.health <= 0) {
      this.state = 'KO';
      this.vx = hitbox.knockbackX * 1.5;
      this.vy = -12;
      return;
    }

    if (!wasBlocked) {
      this.state = 'HITSTUN';
      this.hitstunFrames = hitbox.hitstun;
      this.stateFrame = 0;
      this.vx = hitbox.knockbackX;
      this.vy = hitbox.knockbackY;
    } else {
      // Minor block pushback
      this.vx = hitbox.knockbackX * 0.35;
    }
  }

  // Render on 2D Canvas
  public render(ctx: CanvasRenderingContext2D) {
    const isCrouching = this.state === 'CROUCH';
    const drawHeight = isCrouching ? this.height - 40 : this.height;
    const drawY = isCrouching ? this.y + 40 : this.y;

    // Shadow
    ctx.beginPath();
    ctx.ellipse(this.x + this.width / 2, this.y + this.height + 2, this.width / 1.8, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // Body Capsule
    ctx.save();
    ctx.fillStyle = this.charDef.color;
    ctx.strokeStyle = this.charDef.accentColor;
    ctx.lineWidth = 3;

    // Hitstun Flash
    if (this.state === 'HITSTUN' && this.stateFrame % 2 === 0) {
      ctx.fillStyle = '#ffffff';
    }

    // Draw stylized anime torso & limbs
    ctx.beginPath();
    ctx.roundRect(this.x, drawY, this.width, drawHeight, 14);
    ctx.fill();
    ctx.stroke();

    // Head / Eye Band
    const eyeY = drawY + 16;
    ctx.fillStyle = '#090d16';
    ctx.fillRect(this.x + 8, eyeY, this.width - 16, 12);

    // Glowing Anime Eyes
    ctx.fillStyle = this.charDef.accentColor;
    ctx.shadowColor = this.charDef.accentColor;
    ctx.shadowBlur = 8;
    const eyeOffsetX = this.facing === 1 ? 14 : 6;
    ctx.fillRect(this.x + eyeOffsetX, eyeY + 3, 10, 6);
    ctx.shadowBlur = 0;

    // Blocking Shield Aura
    if (this.state === 'BLOCK') {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      const shieldX = this.facing === 1 ? this.x + this.width + 5 : this.x - 5;
      ctx.arc(shieldX, drawY + drawHeight / 2, 40, -Math.PI / 2, Math.PI / 2, this.facing !== 1);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Active Attack Visual Trails & Weapons
    if (this.activeHitbox) {
      ctx.fillStyle = this.activeHitbox.isSuper
        ? 'rgba(236, 72, 153, 0.7)'
        : 'rgba(245, 158, 11, 0.6)';
      ctx.shadowColor = this.charDef.color;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.roundRect(
        this.activeHitbox.x,
        this.activeHitbox.y,
        this.activeHitbox.width,
        this.activeHitbox.height,
        10
      );
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.restore();

    // Render Impact Sparks
    for (const spark of this.sparks) {
      ctx.fillStyle = spark.color;
      ctx.fillRect(spark.x, spark.y, 4, 4);
    }
  }
}
