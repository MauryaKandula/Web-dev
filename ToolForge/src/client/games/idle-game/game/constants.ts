import { Generator, Upgrade, Achievement, GameState } from '../types.ts';

export const INITIAL_GENERATORS: Record<string, Generator> = {
  gen_nanowire: {
    id: 'gen_nanowire',
    name: 'Nanowire Smelter',
    tier: 1,
    tierName: 'Small Workshop',
    baseCost: 15,
    baseCps: 1,
    costMultiplier: 1.15,
    count: 0,
    description: 'Synthesizes micro-conductors from elemental scrap.',
    lore: 'A rudimentary desktop fabrication rig running on leftover copper filament.'
  },
  gen_conveyor: {
    id: 'gen_conveyor',
    name: 'Robotic Assembler',
    tier: 2,
    tierName: 'Automated Factory',
    baseCost: 120,
    baseCps: 8,
    costMultiplier: 1.15,
    count: 0,
    description: 'Precision automated arms operating on continuous high-speed belts.',
    lore: 'Removes the human bottleneck with 24/7 continuous pneumatic sorting.'
  },
  gen_foundry: {
    id: 'gen_foundry',
    name: 'Heavy Foundry Matrix',
    tier: 3,
    tierName: 'Industrial City',
    baseCost: 1400,
    baseCps: 65,
    costMultiplier: 1.15,
    count: 0,
    description: 'Multi-megawatt arc furnaces producing structural composites.',
    lore: 'Pours molten durasteel into prefabricated modular infrastructure grids.'
  },
  gen_orbital: {
    id: 'gen_orbital',
    name: 'Orbital Cargo Relay',
    tier: 4,
    tierName: 'Global Corporation',
    baseCost: 18000,
    baseCps: 420,
    costMultiplier: 1.15,
    count: 0,
    description: 'Sub-orbital magnetic catapults lifting payloads to low planetary orbit.',
    lore: 'Bypasses surface logistics entirely by utilizing zero-drag orbital insertion.'
  },
  gen_geothermal: {
    id: 'gen_geothermal',
    name: 'Core Energy Tap',
    tier: 5,
    tierName: 'Planetary Industry',
    baseCost: 260000,
    baseCps: 2900,
    costMultiplier: 1.15,
    count: 0,
    description: 'Drills deep into the planetary mantle to harvest magma thermodynamics.',
    lore: 'Powers continental-scale fabrication hubs with limitless tectonic pressure.'
  },
  gen_asteroid: {
    id: 'gen_asteroid',
    name: 'Asteroid Harvester',
    tier: 6,
    tierName: 'Interplanetary Empire',
    baseCost: 4500000,
    baseCps: 34000,
    costMultiplier: 1.15,
    count: 0,
    description: 'Autonomous void-drones strip-mining nickel-iron planetoids.',
    lore: 'Transmutes celestial rocks into trillions of raw titanium ingots.'
  },
  gen_dyson: {
    id: 'gen_dyson',
    name: 'Dyson Swarm Receiver',
    tier: 7,
    tierName: 'Galactic Megastructure',
    baseCost: 95000000,
    baseCps: 450000,
    costMultiplier: 1.15,
    count: 0,
    description: 'Orbital mirrors capturing stellar radiance directly from the star.',
    lore: 'Harnesses the complete fusion output of an entire solar system.'
  }
};

export const INITIAL_UPGRADES: Record<string, Upgrade> = {
  up_nanowire_1: {
    id: 'up_nanowire_1',
    name: 'Superconducting Filaments',
    cost: 100,
    multiplier: 2,
    targetGeneratorId: 'gen_nanowire',
    purchased: false,
    description: 'Doubles Nanowire Smelter efficiency via zero-resistance alloys.'
  },
  up_conveyor_1: {
    id: 'up_conveyor_1',
    name: 'Neural Control Arms',
    cost: 1000,
    multiplier: 2,
    targetGeneratorId: 'gen_conveyor',
    purchased: false,
    description: 'Robotic Assemblers anticipate production bottlenecks and output 2x.'
  },
  up_foundry_1: {
    id: 'up_foundry_1',
    name: 'Plasma Arc Torches',
    cost: 12000,
    multiplier: 2,
    targetGeneratorId: 'gen_foundry',
    purchased: false,
    description: 'Heavy Foundries smelt complex ores twice as fast.'
  },
  up_orbital_1: {
    id: 'up_orbital_1',
    name: 'Gravity Sling Trajectories',
    cost: 150000,
    multiplier: 2,
    targetGeneratorId: 'gen_orbital',
    purchased: false,
    description: 'Optimized orbital calculations double Cargo Relay throughput.'
  },
  up_geothermal_1: {
    id: 'up_geothermal_1',
    name: 'Magma Heat Exchangers',
    cost: 2000000,
    multiplier: 2,
    targetGeneratorId: 'gen_geothermal',
    purchased: false,
    description: 'Captures high-enthalpy volcanic steam, doubling Core Tap generation.'
  },
  up_asteroid_1: {
    id: 'up_asteroid_1',
    name: 'Quantum Mining Beams',
    cost: 35000000,
    multiplier: 2,
    targetGeneratorId: 'gen_asteroid',
    purchased: false,
    description: 'Direct laser ablation triples Asteroid Harvester output.',
  },
  up_dyson_1: {
    id: 'up_dyson_1',
    name: 'Stellar Flux Condensers',
    cost: 750000000,
    multiplier: 2,
    targetGeneratorId: 'gen_dyson',
    purchased: false,
    description: 'Reflective metamaterials double Dyson Swarm energy capture.'
  },
  up_global_1: {
    id: 'up_global_1',
    name: 'Integrated Machine Logic',
    cost: 50000,
    multiplier: 1.5,
    purchased: false,
    description: 'A global 1.5x production multiplier across all industrial tiers.'
  },
  up_global_2: {
    id: 'up_global_2',
    name: 'Chrono-Clock Overclocking',
    cost: 10000000,
    multiplier: 2.0,
    purchased: false,
    description: 'Compresses operational micro-delays for a global 2x boost.'
  }
};

export const INITIAL_ACHIEVEMENTS: Record<string, Achievement> = {
  ach_first_spark: {
    id: 'ach_first_spark',
    name: 'First Spark',
    description: 'Generate your very first credit manually.',
    unlocked: false,
    icon: 'Zap'
  },
  ach_workshop: {
    id: 'ach_workshop',
    name: 'Workshop Pioneer',
    description: 'Construct 10 Nanowire Smelters.',
    unlocked: false,
    icon: 'Hammer'
  },
  ach_automation: {
    id: 'ach_automation',
    name: 'Industrial Age',
    description: 'Deploy your first Robotic Assembler.',
    unlocked: false,
    icon: 'Cpu'
  },
  ach_foundry_master: {
    id: 'ach_foundry_master',
    name: 'Heavy Metals',
    description: 'Reach 25 Heavy Foundry Matrices.',
    unlocked: false,
    icon: 'Flame'
  },
  ach_orbital: {
    id: 'ach_orbital',
    name: 'Spacebound Logistics',
    description: 'Launch your first Orbital Cargo Relay.',
    unlocked: false,
    icon: 'Rocket'
  },
  ach_planetary: {
    id: 'ach_planetary',
    name: 'Tectonic Master',
    description: 'Tap deep into the planetary mantle.',
    unlocked: false,
    icon: 'Globe'
  },
  ach_megastructure: {
    id: 'ach_megastructure',
    name: 'Galactic Architect',
    description: 'Activate a Dyson Swarm Receiver.',
    unlocked: false,
    icon: 'Sun'
  },
  ach_millionaire: {
    id: 'ach_millionaire',
    name: 'Credit Millionaire',
    description: 'Amass 1,000,000 credits in lifetime volume.',
    unlocked: false,
    icon: 'Coins'
  },
  ach_billionaire: {
    id: 'ach_billionaire',
    name: 'Galactic Billionaire',
    description: 'Amass 1,000,000,000 lifetime credits.',
    unlocked: false,
    icon: 'Sparkles'
  },
  ach_transcend: {
    id: 'ach_transcend',
    name: 'Cosmic Rebirth',
    description: 'Perform Quantum Transcendence and claim Antimatter Cores.',
    unlocked: false,
    icon: 'Atom'
  },
  ach_overdrive: {
    id: 'ach_overdrive',
    name: 'Overdrive Pilot',
    description: 'Engage 2x Overdrive via Comms Boost.',
    unlocked: false,
    icon: 'Radio'
  }
};

export const DEFAULT_GAME_STATE: GameState = {
  version: 1,
  credits: 0,
  totalLifetimeCredits: 0,
  antimatterCores: 0,
  coreMultiplierPercent: 2,
  overdriveEndTime: 0,
  lastSaveTimestamp: Date.now(),
  generators: INITIAL_GENERATORS,
  upgrades: INITIAL_UPGRADES,
  achievements: INITIAL_ACHIEVEMENTS,
  stats: {
    manualClicks: 0,
    totalManualCredits: 0,
    timePlayedSeconds: 0,
    timesPrestiged: 0,
    peakCps: 0,
    adBoostsClaimed: 0
  },
  soundEnabled: true
};
