import { describe, expect, it } from 'vitest';
import {
  generateAestheticsTools,
  generateUtilityTools,
  generateDevTools,
  ingestTop100Tools
} from '../server/tools_catalog_engine.ts';

describe('unverified third-party catalog ingestion', () => {
  it('does not create products until their source, license, package, and distribution rights are reviewed', () => {
    expect(generateAestheticsTools()).toEqual([]);
    expect(generateUtilityTools()).toEqual([]);
    expect(generateDevTools()).toEqual([]);
  });

  it('does not write unreviewed listings into the local database', async () => {
    await expect(ingestTop100Tools()).resolves.toEqual({ ingested: 0, total: 0 });
  });
});
