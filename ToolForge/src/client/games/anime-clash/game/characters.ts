import { CharacterDef } from '../types.ts';

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'rin',
    name: 'Kurogane Rin',
    title: 'The Cyber Ronin',
    archetype: 'Speed / Katana Duelist',
    color: '#00e5ff',
    accentColor: '#ec4899',
    stats: {
      speed: 9,
      power: 6,
      defense: 5
    },
    specialMoveName: 'Sakura Flash (Dash Slash)',
    superMoveName: 'Omni-Slash 9000',
    bio: 'A sleep-deprived anime coder and swordswoman. Fights with an overclocked LED katana and refuses to fight without eurobeat playing.',
    victoryQuote: 'Another bug crushed in production! Git commit -m "Victory"!'
  },
  {
    id: 'baku',
    name: 'Baku the Wok Master',
    title: 'The Iron Chef',
    archetype: 'Heavy / Grappler',
    color: '#f97316',
    accentColor: '#eab308',
    stats: {
      speed: 4,
      power: 10,
      defense: 8
    },
    specialMoveName: 'Boiling Broth Toss',
    superMoveName: 'Seismic Wok Slam',
    bio: 'Expelled from culinary academy for infusing 500% more MSG than legally permitted. Wields a 40kg forged durasteel cast iron wok.',
    victoryQuote: 'Your defense had zero flavor! Needs more chili crisp!'
  },
  {
    id: 'astraea',
    name: 'Astraea Voidcaller',
    title: 'Celestial Sorceress',
    archetype: 'Zoner / Quantum Mage',
    color: '#a855f7',
    accentColor: '#38bdf8',
    stats: {
      speed: 6,
      power: 7,
      defense: 6
    },
    specialMoveName: 'Starlight Spark Burst',
    superMoveName: 'Supernova Singularity',
    bio: 'A chuunibyou astrophysics graduate who accidentally ripped an actual wormhole open during her semester final exam.',
    victoryQuote: 'The cosmic entropy of your defeat was mathematically preordained.'
  },
  {
    id: 'sparky',
    name: 'Sparky G',
    title: 'DJ Volt / Bass Brawler',
    archetype: 'Rushdown / Electro-Brawler',
    color: '#eab308',
    accentColor: '#10b981',
    stats: {
      speed: 8,
      power: 7,
      defense: 7
    },
    specialMoveName: 'Bassline Shockwave',
    superMoveName: 'Drop The Bass',
    bio: 'Underground synthwave producer whose beat drops hit with enough kinetic voltage to blow a regional substation.',
    victoryQuote: 'Track BPM too fast for you? That was only 140!'
  }
];
