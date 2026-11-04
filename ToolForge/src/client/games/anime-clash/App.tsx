import React, { useState, useEffect, useRef } from 'react';
import { CharacterDef, StageDef, CpuDifficulty, MatchRoundState } from './types.ts';
import { CHARACTERS } from './game/characters.ts';
import { STAGES, renderStageBackground } from './game/stages.ts';
import { Fighter } from './game/fighter.ts';
import { CpuController } from './game/ai.ts';
import { checkAABBCollision, calculateDamage } from './game/physics.ts';
import { fightSound } from './game/audio.ts';
import { CharacterSelect } from './components/CharacterSelect.tsx';
import { FightHud } from './components/FightHud.tsx';
import { TouchControls } from './components/TouchControls.tsx';
import { VictoryModal } from './components/VictoryModal.tsx';

export const App: React.FC = () => {
  const [matchState, setMatchState] = useState<'SELECT' | 'FIGHT' | 'ROUND_OVER' | 'MATCH_OVER'>('SELECT');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Selected Characters & Stage
  const [p1Char, setP1Char] = useState<CharacterDef>(CHARACTERS[0]);
  const [p2Char, setP2Char] = useState<CharacterDef>(CHARACTERS[1]);
  const [activeStage, setActiveStage] = useState<StageDef>(STAGES[0]);
  const [difficulty, setDifficulty] = useState<CpuDifficulty>('medium');

  // Match & Round State
  const [roundState, setRoundState] = useState<MatchRoundState>({
    roundNumber: 1,
    p1Wins: 0,
    p2Wins: 0,
    timeLeft: 60,
    winner: null
  });

  const [comboCount, setComboCount] = useState(0);
  const [roundBanner, setRoundBanner] = useState<string | null>(null);

  // Canvas Ref & Game Entities
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fighter1Ref = useRef<Fighter | null>(null);
  const fighter2Ref = useRef<Fighter | null>(null);
  const cpuAiRef = useRef<CpuController>(new CpuController('medium'));

  // Active Key Input Map
  const keysPressed = useRef<Record<string, boolean>>({});

  // Audio Sync
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    fightSound.setEnabled(next);
  };

  // Start Match
  const handleStartMatch = (
    p1: CharacterDef,
    p2: CharacterDef,
    stg: StageDef,
    diff: CpuDifficulty
  ) => {
    setP1Char(p1);
    setP2Char(p2);
    setActiveStage(stg);
    setDifficulty(diff);

    fighter1Ref.current = new Fighter(p1, true, 220, stg.groundY);
    fighter2Ref.current = new Fighter(p2, false, 680, stg.groundY);
    cpuAiRef.current.setDifficulty(diff);

    setRoundState({
      roundNumber: 1,
      p1Wins: 0,
      p2Wins: 0,
      timeLeft: 60,
      winner: null
    });

    setComboCount(0);
    setMatchState('FIGHT');

    setRoundBanner('ROUND 1 ... FIGHT!');
    setTimeout(() => setRoundBanner(null), 2000);
  };

  // Keyboard Event Listeners
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;

      if (matchState !== 'FIGHT' || !fighter1Ref.current) return;
      const p1 = fighter1Ref.current;

      if (e.key.toLowerCase() === 'w') p1.jump();
      else if (e.key.toLowerCase() === 's') p1.crouch();
      else if (e.key.toLowerCase() === 'b') p1.block();
      else if (e.key.toLowerCase() === 'j') {
        if (p1.punch()) fightSound.playPunch();
      } else if (e.key.toLowerCase() === 'k') {
        if (p1.kick()) fightSound.playKick();
      } else if (e.key.toLowerCase() === 'l') {
        if (p1.special()) fightSound.playPunch();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (p1.superAttack()) fightSound.playSuper();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;

      if (!fighter1Ref.current) return;
      const p1 = fighter1Ref.current;

      if (e.key.toLowerCase() === 's') p1.stopCrouch();
      if (e.key.toLowerCase() === 'b') p1.stopBlock();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [matchState]);

  // Round Timer Countdown (Every 1s)
  useEffect(() => {
    if (matchState !== 'FIGHT') return;

    const timer = setInterval(() => {
      setRoundState((prev) => {
        if (prev.timeLeft <= 1) {
          return { ...prev, timeLeft: 0 };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [matchState]);

  // Main 60 FPS Canvas Game Loop
  useEffect(() => {
    if (matchState === 'SELECT') return;

    let animId: number;

    const loop = (timestamp: number) => {
      const canvas = canvasRef.current;
      const p1 = fighter1Ref.current;
      const p2 = fighter2Ref.current;

      if (canvas && p1 && p2) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = canvas.width;
          const height = canvas.height;

          // 1. Process P1 Continuous Movement
          if (matchState === 'FIGHT') {
            if (keysPressed.current['a']) {
              p1.move(-1);
            } else if (keysPressed.current['d']) {
              p1.move(1);
            } else {
              p1.stopWalk();
            }

            // Facing auto-align
            p1.facing = p1.x < p2.x ? 1 : -1;

            // 2. Process CPU AI
            cpuAiRef.current.update(p2, p1);

            // 3. Update Entities
            p1.update(activeStage.groundY, width);
            p2.update(activeStage.groundY, width);

            // 4. Hitbox Collision Check (P1 Attacks P2)
            if (p1.activeHitbox && !p1.hasHitCurrentAttack) {
              const p2Hurtbox = p2.getHurtbox();
              if (checkAABBCollision(p1.activeHitbox, p2Hurtbox)) {
                const isBlocked = p2.state === 'BLOCK';
                const { finalDamage, wasBlocked } = calculateDamage(
                  p1.activeHitbox.damage,
                  isBlocked,
                  p2.charDef.stats.defense
                );

                p2.takeHit(p1.activeHitbox, finalDamage, wasBlocked);
                p1.hasHitCurrentAttack = true;

                if (wasBlocked) {
                  fightSound.playBlock();
                } else {
                  if (p1.activeHitbox.isSuper) fightSound.playSuper();
                  else fightSound.playKick();
                  setComboCount((c) => c + 1);
                }
              }
            }

            // 5. Hitbox Collision Check (P2 Attacks P1)
            if (p2.activeHitbox && !p2.hasHitCurrentAttack) {
              const p1Hurtbox = p1.getHurtbox();
              if (checkAABBCollision(p2.activeHitbox, p1Hurtbox)) {
                const isBlocked = p1.state === 'BLOCK';
                const { finalDamage, wasBlocked } = calculateDamage(
                  p2.activeHitbox.damage,
                  isBlocked,
                  p1.charDef.stats.defense
                );

                p1.takeHit(p2.activeHitbox, finalDamage, wasBlocked);
                p2.hasHitCurrentAttack = true;

                if (wasBlocked) {
                  fightSound.playBlock();
                } else {
                  if (p2.activeHitbox.isSuper) fightSound.playSuper();
                  else fightSound.playKick();
                  setComboCount(0);
                }
              }
            }

            // 6. Round End Conditions Check (KO or Time Out)
            if (p1.health <= 0 || p2.health <= 0 || roundState.timeLeft <= 0) {
              handleRoundComplete(p1, p2);
            }
          }

          // 7. Render Stage Background
          renderStageBackground(ctx, activeStage, width, height, timestamp);

          // 8. Render Fighters
          p1.render(ctx);
          p2.render(ctx);
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [matchState, activeStage, roundState.timeLeft]);

  const handleRoundComplete = (p1: Fighter, p2: Fighter) => {
    fightSound.playKoGong();
    setMatchState('ROUND_OVER');

    let roundWinner: 1 | 2 = 1;
    if (p1.health <= 0 && p2.health > 0) roundWinner = 2;
    else if (p2.health <= 0 && p1.health > 0) roundWinner = 1;
    else roundWinner = p1.health >= p2.health ? 1 : 2;

    const newP1Wins = roundWinner === 1 ? roundState.p1Wins + 1 : roundState.p1Wins;
    const newP2Wins = roundWinner === 2 ? roundState.p2Wins + 1 : roundState.p2Wins;

    setRoundBanner(roundWinner === 1 ? 'K.O.! PLAYER 1 WINS ROUND!' : 'K.O.! CPU WINS ROUND!');

    // Check Match Win (Best 2 of 3)
    if (newP1Wins >= 2 || newP2Wins >= 2) {
      setTimeout(() => {
        setRoundState((prev) => ({
          ...prev,
          p1Wins: newP1Wins,
          p2Wins: newP2Wins,
          winner: newP1Wins >= 2 ? 1 : 2
        }));
        setMatchState('MATCH_OVER');
      }, 2000);
    } else {
      // Advance to Next Round
      setTimeout(() => {
        p1.reset(220, activeStage.groundY);
        p2.reset(680, activeStage.groundY);
        setRoundState((prev) => ({
          ...prev,
          roundNumber: prev.roundNumber + 1,
          p1Wins: newP1Wins,
          p2Wins: newP2Wins,
          timeLeft: 60
        }));
        setComboCount(0);
        setMatchState('FIGHT');
        setRoundBanner(`ROUND ${roundState.roundNumber + 1} ... FIGHT!`);
        setTimeout(() => setRoundBanner(null), 2000);
      }, 2500);
    }
  };

  const handleRematch = () => {
    if (!fighter1Ref.current || !fighter2Ref.current) return;
    fighter1Ref.current.reset(220, activeStage.groundY);
    fighter2Ref.current.reset(680, activeStage.groundY);
    setRoundState({
      roundNumber: 1,
      p1Wins: 0,
      p2Wins: 0,
      timeLeft: 60,
      winner: null
    });
    setComboCount(0);
    setMatchState('FIGHT');
    setRoundBanner('ROUND 1 ... FIGHT!');
    setTimeout(() => setRoundBanner(null), 2000);
  };

  const p1Fighter = fighter1Ref.current;
  const p2Fighter = fighter2Ref.current;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center overflow-hidden relative">
      {matchState === 'SELECT' ? (
        <CharacterSelect
          onStartMatch={handleStartMatch}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
        />
      ) : (
        <div className="relative w-full max-w-[960px] aspect-[16/9] bg-slate-950 rounded-2xl overflow-hidden border border-purple-950 shadow-2xl">
          {/* Top In-Game HUD */}
          {p1Fighter && p2Fighter && (
            <FightHud
              p1={p1Fighter}
              p2={p2Fighter}
              roundState={roundState}
              comboCount={comboCount}
            />
          )}

          {/* Canvas Viewport */}
          <canvas
            ref={canvasRef}
            width={960}
            height={540}
            className="w-full h-full block"
          />

          {/* Round Announcement Banner */}
          {roundBanner && (
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none animate-pulse">
              <span className="text-3xl sm:text-5xl font-black font-bungee tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-500 to-cyan-400 drop-shadow-[0_0_25px_rgba(239,68,68,0.9)]">
                {roundBanner}
              </span>
            </div>
          )}

          {/* Touch Controls for Mobile */}
          {p1Fighter && (
            <TouchControls
              onMoveLeftStart={() => p1Fighter.move(-1)}
              onMoveLeftEnd={() => p1Fighter.stopWalk()}
              onMoveRightStart={() => p1Fighter.move(1)}
              onMoveRightEnd={() => p1Fighter.stopWalk()}
              onJump={() => p1Fighter.jump()}
              onCrouchStart={() => p1Fighter.crouch()}
              onCrouchEnd={() => p1Fighter.stopCrouch()}
              onBlockStart={() => p1Fighter.block()}
              onBlockEnd={() => p1Fighter.stopBlock()}
              onPunch={() => { if (p1Fighter.punch()) fightSound.playPunch(); }}
              onKick={() => { if (p1Fighter.kick()) fightSound.playKick(); }}
              onSpecial={() => { if (p1Fighter.special()) fightSound.playPunch(); }}
              onSuper={() => { if (p1Fighter.superAttack()) fightSound.playSuper(); }}
              isSuperReady={p1Fighter.superMeter >= 100}
            />
          )}

          {/* Victory Modal */}
          {matchState === 'MATCH_OVER' && (roundState.winner === 1 || roundState.winner === 2) && (
            <VictoryModal
              winner={roundState.winner}
              winnerChar={roundState.winner === 1 ? p1Char : p2Char}
              onRematch={handleRematch}
              onSelectCharacter={() => setMatchState('SELECT')}
            />
          )}
        </div>
      )}
    </div>
  );
};
