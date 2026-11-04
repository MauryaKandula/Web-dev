import React, { useState, useEffect, useRef } from 'react';
import { GameState, Generator } from './types.ts';
import { loadGameState, saveGameState } from './game/storage.ts';
import {
  calculateTotalCps,
  calculateBulkCost,
  calculateOfflineProgress,
  calculatePrestigeCores,
  formatNumber
} from './game/formulas.ts';
import { sound } from './game/audio.ts';
import { Header } from './components/Header.tsx';
import { ClickerArea } from './components/ClickerArea.tsx';
import { GeneratorCard } from './components/GeneratorCard.tsx';
import { UpgradePanel } from './components/UpgradePanel.tsx';
import { PrestigeModal } from './components/PrestigeModal.tsx';
import { OverdriveModal } from './components/OverdriveModal.tsx';
import { AchievementsModal } from './components/AchievementsModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { OfflineProgressModal } from './components/OfflineProgressModal.tsx';
import { Trophy } from 'lucide-react';

export const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => loadGameState());
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [offlineEarnings, setOfflineEarnings] = useState<{ elapsedSeconds: number; creditsEarned: number } | null>(null);
  const [unlockedBanner, setUnlockedBanner] = useState<string | null>(null);

  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  // Initialize Audio state
  useEffect(() => {
    sound.setEnabled(gameState.soundEnabled);
  }, [gameState.soundEnabled]);

  // Compute live Overdrive state
  const now = Date.now();
  const isOverdriveActive = gameState.overdriveEndTime > now;
  const overdriveRemainingSeconds = Math.max(0, Math.floor((gameState.overdriveEndTime - now) / 1000));

  // Compute live CPS
  const totalCps = calculateTotalCps(
    gameState.generators,
    gameState.upgrades,
    gameState.antimatterCores,
    isOverdriveActive
  );

  // Click power: 1 + 1% of CPS
  const clickPower = Math.max(1, Math.floor(1 + totalCps * 0.01));

  // Check highest active tier name
  const generatorList = Object.values(gameState.generators);
  const highestOwnedGen = [...generatorList].reverse().find((g) => g.count > 0);
  const highestTierName = highestOwnedGen ? highestOwnedGen.tierName : 'Small Workshop';

  // Check Offline Catch-up on initial load
  useEffect(() => {
    const offline = calculateOfflineProgress(gameState.lastSaveTimestamp, Date.now(), totalCps);
    if (offline.creditsEarned > 0) {
      setOfflineEarnings(offline);
    }
  }, []);

  // Main High-Precision Game Loop & Tick Engine (100ms ticks)
  useEffect(() => {
    let lastTick = Date.now();
    let autoSaveAccumulator = 0;

    const interval = setInterval(() => {
      const currentTick = Date.now();
      const dt = (currentTick - lastTick) / 1000;
      lastTick = currentTick;

      setGameState((prev) => {
        const isOverdrive = prev.overdriveEndTime > currentTick;
        const currentCps = calculateTotalCps(
          prev.generators,
          prev.upgrades,
          prev.antimatterCores,
          isOverdrive
        );

        const deltaCredits = currentCps * dt;
        const newCredits = prev.credits + deltaCredits;
        const newLifetime = prev.totalLifetimeCredits + deltaCredits;

        // Check Achievements
        const updatedAchievements = { ...prev.achievements };
        let newlyUnlockedName: string | null = null;

        const checkUnlock = (id: string, condition: boolean) => {
          if (updatedAchievements[id] && !updatedAchievements[id].unlocked && condition) {
            updatedAchievements[id] = {
              ...updatedAchievements[id],
              unlocked: true,
              unlockedAt: currentTick
            };
            newlyUnlockedName = updatedAchievements[id].name;
            sound.playAchievement();
          }
        };

        checkUnlock('ach_first_spark', newLifetime >= 1);
        checkUnlock('ach_workshop', prev.generators.gen_nanowire.count >= 10);
        checkUnlock('ach_automation', prev.generators.gen_conveyor.count >= 1);
        checkUnlock('ach_foundry_master', prev.generators.gen_foundry.count >= 25);
        checkUnlock('ach_orbital', prev.generators.gen_orbital.count >= 1);
        checkUnlock('ach_planetary', prev.generators.gen_geothermal.count >= 1);
        checkUnlock('ach_belt_miner', prev.generators.gen_asteroid.count >= 10);
        checkUnlock('ach_megastructure', prev.generators.gen_dyson.count >= 1);
        checkUnlock('ach_millionaire', newLifetime >= 1_000_000);
        checkUnlock('ach_billionaire', newLifetime >= 1_000_000_000);
        checkUnlock('ach_transcend', prev.stats.timesPrestiged >= 1);
        checkUnlock('ach_overdrive', prev.stats.adBoostsClaimed >= 1);

        if (newlyUnlockedName) {
          setUnlockedBanner(newlyUnlockedName);
          setTimeout(() => setUnlockedBanner(null), 4000);
        }

        // Auto Save Accumulator (Every 5 seconds)
        autoSaveAccumulator += dt;
        if (autoSaveAccumulator >= 5) {
          autoSaveAccumulator = 0;
          saveGameState({
            ...prev,
            credits: newCredits,
            totalLifetimeCredits: newLifetime,
            achievements: updatedAchievements,
            stats: {
              ...prev.stats,
              timePlayedSeconds: prev.stats.timePlayedSeconds + 5,
              peakCps: Math.max(prev.stats.peakCps, currentCps)
            }
          });
        }

        return {
          ...prev,
          credits: newCredits,
          totalLifetimeCredits: newLifetime,
          achievements: updatedAchievements,
          stats: {
            ...prev.stats,
            timePlayedSeconds: prev.stats.timePlayedSeconds + dt,
            peakCps: Math.max(prev.stats.peakCps, currentCps)
          }
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Handlers
  const handleManualClick = () => {
    sound.playClick();
    setGameState((prev) => ({
      ...prev,
      credits: prev.credits + clickPower,
      totalLifetimeCredits: prev.totalLifetimeCredits + clickPower,
      stats: {
        ...prev.stats,
        manualClicks: prev.stats.manualClicks + 1,
        totalManualCredits: prev.stats.totalManualCredits + clickPower
      }
    }));
  };

  const handleBuyGenerator = (generatorId: string, quantity: number) => {
    const gen = gameState.generators[generatorId];
    if (!gen || quantity <= 0) return;

    const totalCost = calculateBulkCost(gen.baseCost, gen.count, gen.costMultiplier, quantity);
    if (gameState.credits < totalCost) return;

    sound.playBuy();
    setGameState((prev) => ({
      ...prev,
      credits: prev.credits - totalCost,
      generators: {
        ...prev.generators,
        [generatorId]: {
          ...gen,
          count: gen.count + quantity
        }
      }
    }));
  };

  const handleBuyUpgrade = (upgradeId: string) => {
    const up = gameState.upgrades[upgradeId];
    if (!up || up.purchased || gameState.credits < up.cost) return;

    sound.playBuy();
    setGameState((prev) => ({
      ...prev,
      credits: prev.credits - up.cost,
      upgrades: {
        ...prev.upgrades,
        [upgradeId]: {
          ...up,
          purchased: true
        }
      }
    }));
  };

  const handleConfirmPrestige = () => {
    const gainedCores = Math.max(0, calculatePrestigeCores(gameState.totalLifetimeCredits) - gameState.antimatterCores);
    if (gainedCores <= 0) return;

    sound.playPrestige();

    // Reset generators and upgrades while preserving lifetime stats and cores
    const resetGenerators = { ...gameState.generators };
    for (const key in resetGenerators) {
      resetGenerators[key] = { ...resetGenerators[key], count: 0 };
    }

    const resetUpgrades = { ...gameState.upgrades };
    for (const key in resetUpgrades) {
      resetUpgrades[key] = { ...resetUpgrades[key], purchased: false };
    }

    setGameState((prev) => ({
      ...prev,
      credits: 0,
      antimatterCores: prev.antimatterCores + gainedCores,
      generators: resetGenerators,
      upgrades: resetUpgrades,
      stats: {
        ...prev.stats,
        timesPrestiged: prev.stats.timesPrestiged + 1
      }
    }));

    setActiveModal(null);
  };

  const handleClaimOverdriveBoost = () => {
    sound.playBuy();
    const fourHoursMs = 4 * 60 * 60 * 1000;
    setGameState((prev) => ({
      ...prev,
      overdriveEndTime: Math.max(Date.now(), prev.overdriveEndTime) + fourHoursMs,
      stats: {
        ...prev.stats,
        adBoostsClaimed: prev.stats.adBoostsClaimed + 1
      }
    }));
  };

  const handleInstantWarp = (hours: number) => {
    sound.playBuy();
    const seconds = hours * 3600;
    const earned = totalCps * seconds;
    setGameState((prev) => ({
      ...prev,
      credits: prev.credits + earned,
      totalLifetimeCredits: prev.totalLifetimeCredits + earned
    }));
    setActiveModal(null);
  };

  const handleToggleSound = () => {
    const next = !gameState.soundEnabled;
    sound.setEnabled(next);
    setGameState((prev) => ({ ...prev, soundEnabled: next }));
  };

  const handleClaimOfflineReserves = () => {
    if (offlineEarnings) {
      sound.playBuy();
      setGameState((prev) => ({
        ...prev,
        credits: prev.credits + offlineEarnings.creditsEarned,
        totalLifetimeCredits: prev.totalLifetimeCredits + offlineEarnings.creditsEarned
      }));
      setOfflineEarnings(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Newly Unlocked Achievement Notification Banner */}
      {unlockedBanner && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="flex items-center space-x-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-950 border border-purple-500/60 shadow-2xl backdrop-blur-md">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-300 block">Milestone Achieved!</span>
              <span className="text-xs font-bold text-white font-orbitron">{unlockedBanner}</span>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <Header
        credits={gameState.credits}
        cps={totalCps}
        antimatterCores={gameState.antimatterCores}
        highestTierName={highestTierName}
        isOverdriveActive={isOverdriveActive}
        overdriveRemainingSeconds={overdriveRemainingSeconds}
        soundEnabled={gameState.soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenOverdrive={() => setActiveModal('overdrive')}
        onOpenAchievements={() => setActiveModal('achievements')}
        onOpenPrestige={() => setActiveModal('prestige')}
        onOpenSettings={() => setActiveModal('settings')}
      />

      {/* Main Game Screen */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Reactor Core & Research Lab (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <ClickerArea
              onManualClick={handleManualClick}
              clickPower={clickPower}
              totalClicks={gameState.stats.manualClicks}
            />

            <UpgradePanel
              upgrades={gameState.upgrades}
              availableCredits={gameState.credits}
              onBuyUpgrade={handleBuyUpgrade}
            />
          </div>

          {/* Right Column: Industrial Generators (7 cols) */}
          <div className="lg:col-span-7 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-purple-950/60">
              <h2 className="text-sm font-black text-white font-orbitron tracking-wider uppercase">
                Planetary & Galactic Facilities
              </h2>
              <span className="text-xs font-mono text-purple-400">
                7 Industrial Tiers
              </span>
            </div>

            <div className="space-y-3">
              {Object.values(gameState.generators).map((gen) => {
                // Find multiplier for this generator
                let mult = 1;
                for (const upId in gameState.upgrades) {
                  const up = gameState.upgrades[upId];
                  if (up.purchased && up.targetGeneratorId === gen.id) {
                    mult *= up.multiplier;
                  }
                }

                return (
                  <GeneratorCard
                    key={gen.id}
                    generator={gen}
                    availableCredits={gameState.credits}
                    totalCps={totalCps}
                    multiplier={mult}
                    onBuy={handleBuyGenerator}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-purple-950/40 bg-black/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
          <div>
            <strong className="text-slate-400">Infinite Empire v1.0</strong> • Sci-Fi Incremental Idle & Galactic Megastructure
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>Auto-saving enabled</span>
            <span>•</span>
            <span>Zero Native Bloat</span>
            <span>•</span>
            <span>100% Offline Capable</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {activeModal === 'prestige' && (
        <PrestigeModal
          totalLifetimeCredits={gameState.totalLifetimeCredits}
          currentCores={gameState.antimatterCores}
          coreMultiplierPercent={gameState.coreMultiplierPercent}
          onClose={() => setActiveModal(null)}
          onConfirmPrestige={handleConfirmPrestige}
        />
      )}

      {activeModal === 'overdrive' && (
        <OverdriveModal
          onClose={() => setActiveModal(null)}
          onClaimOverdriveBoost={handleClaimOverdriveBoost}
          onInstantWarp={handleInstantWarp}
        />
      )}

      {activeModal === 'achievements' && (
        <AchievementsModal
          achievements={gameState.achievements}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'settings' && (
        <SettingsModal
          gameState={gameState}
          onClose={() => setActiveModal(null)}
          onRestoreState={(restored) => setGameState(restored)}
          onToggleSound={handleToggleSound}
        />
      )}

      {offlineEarnings && (
        <OfflineProgressModal
          elapsedSeconds={offlineEarnings.elapsedSeconds}
          creditsEarned={offlineEarnings.creditsEarned}
          onClaim={handleClaimOfflineReserves}
        />
      )}
    </div>
  );
};
