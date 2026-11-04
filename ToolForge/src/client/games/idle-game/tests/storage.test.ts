import { describe, it, expect, beforeEach } from 'vitest';
import { exportSaveString, importSaveString } from '../game/storage.ts';
import { DEFAULT_GAME_STATE } from '../game/constants.ts';

// Mock localStorage in Vitest environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('Infinite Empire Save & Serialization Engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('exports state to a valid base64 encoded string and imports cleanly', () => {
    const testState = {
      ...DEFAULT_GAME_STATE,
      credits: 450000,
      totalLifetimeCredits: 1200000,
      antimatterCores: 25,
      generators: {
        ...DEFAULT_GAME_STATE.generators,
        gen_nanowire: { ...DEFAULT_GAME_STATE.generators.gen_nanowire, count: 50 },
        gen_conveyor: { ...DEFAULT_GAME_STATE.generators.gen_conveyor, count: 12 }
      }
    };

    const encoded = exportSaveString(testState);
    expect(typeof encoded).toBe('string');
    expect(encoded.length).toBeGreaterThan(20);

    const imported = importSaveString(encoded);
    expect(imported).not.toBeNull();
    expect(imported?.credits).toBe(450000);
    expect(imported?.totalLifetimeCredits).toBe(1200000);
    expect(imported?.antimatterCores).toBe(25);
    expect(imported?.generators.gen_nanowire.count).toBe(50);
    expect(imported?.generators.gen_conveyor.count).toBe(12);
  });

  it('safely rejects corrupted or malformed save strings', () => {
    expect(importSaveString('corrupted_not_base64_json!@#$')).toBeNull();
    expect(importSaveString(btoa('{"invalid": true}'))).toBeNull();
    expect(importSaveString('')).toBeNull();
  });
});
