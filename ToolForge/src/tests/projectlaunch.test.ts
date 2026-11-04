import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';
import {
  starterKitsData,
  getStarterKits,
  getStarterKitById,
  validateKitManifest,
  generateStarterKitZip
} from '../shared/projectlaunch.ts';

describe('ProjectLaunch (Product 05 • Wave B)', () => {
  it('provides all 3 core Indian CSE starter kits with distinct IDs and architectures', () => {
    const kits = getStarterKits();
    expect(kits.length).toBe(3);

    const ids = kits.map(k => k.id);
    expect(ids).toContain('kit_saas_marketplace');
    expect(ids).toContain('kit_idle_economy');
    expect(ids).toContain('kit_combat_canvas');
  });

  it('validates manifest schema completeness for every starter kit', () => {
    for (const kit of starterKitsData) {
      const { valid, errors } = validateKitManifest(kit);
      expect(valid, `Kit ${kit.id} failed validation: ${errors.join(', ')}`).toBe(true);
      expect(errors.length).toBe(0);
      expect(kit.architectureDiagram.length).toBeGreaterThan(50);
      expect(kit.keyMechanisms.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('provides deep placement viva questions with concept definition and examiner traps', () => {
    for (const kit of starterKitsData) {
      expect(kit.vivaQuestions.length).toBeGreaterThanOrEqual(5);
      for (const vq of kit.vivaQuestions) {
        expect(vq.question.trim().length).toBeGreaterThan(10);
        expect(vq.concept.trim().length).toBeGreaterThan(3);
        expect(vq.modelAnswer.trim().length).toBeGreaterThan(30);
        expect(vq.followUp.trim().length).toBeGreaterThan(10);
      }
    }
  });

  it('provides automated test walkthroughs with assertion counts', () => {
    for (const kit of starterKitsData) {
      expect(kit.testWalkthrough.length).toBeGreaterThanOrEqual(2);
      for (const tw of kit.testWalkthrough) {
        expect(tw.testSuite.endsWith('.test.ts')).toBe(true);
        expect(tw.assertionCount).toBeGreaterThan(0);
        expect(tw.description.length).toBeGreaterThan(10);
      }
    }
  });

  it('generates a valid, readable ZIP archive with standard PK zip header', () => {
    const zipBytes = generateStarterKitZip('kit_saas_marketplace', true);
    expect(zipBytes).toBeInstanceOf(Uint8Array);
    expect(zipBytes.length).toBeGreaterThan(500);

    // Standard ZIP file signature: 0x50 0x4B 0x03 0x04 ('PK\x03\x04')
    expect(zipBytes[0]).toBe(0x50);
    expect(zipBytes[1]).toBe(0x4B);
    expect(zipBytes[2]).toBe(0x03);
    expect(zipBytes[3]).toBe(0x04);
  });

  it('embeds license authorization and setup scripts inside generated zip', () => {
    const licensedZip = generateStarterKitZip('kit_idle_economy', true);
    const unLicensedZip = generateStarterKitZip('kit_idle_economy', false);

    const licensedStr = new TextDecoder().decode(licensedZip);
    const unLicensedStr = new TextDecoder().decode(unLicensedZip);

    expect(licensedStr).toContain('Licensed Student Edition');
    expect(unLicensedStr).toContain('Community Evaluation Edition');
    expect(licensedStr).toContain('SETUP.bat');
    expect(licensedStr).toContain('SETUP.sh');
    expect(licensedStr).toContain('VIVA_GUIDE.md');
  });

  it('can be cleanly extracted by native OS zip utilities (PowerShell Expand-Archive)', () => {
    const zipBytes = generateStarterKitZip('kit_saas_marketplace', true);
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'projectlaunch-zip-test-'));
    const zipPath = path.join(tmpDir, 'starter_kit.zip');
    const outDir = path.join(tmpDir, 'extracted');

    try {
      fs.writeFileSync(zipPath, Buffer.from(zipBytes));

      // Execute native PowerShell expansion on Windows to verify RFC 1951 / PKZip standard conformance
      const cmd = `powershell -NoProfile -Command "Expand-Archive -LiteralPath '${zipPath.replace(/'/g, "''")}' -DestinationPath '${outDir.replace(/'/g, "''")}'"`;
      execSync(cmd, { stdio: 'pipe' });

      expect(fs.existsSync(path.join(outDir, 'README.md'))).toBe(true);
      expect(fs.existsSync(path.join(outDir, 'ARCHITECTURE.md'))).toBe(true);
      expect(fs.existsSync(path.join(outDir, 'VIVA_GUIDE.md'))).toBe(true);
      expect(fs.existsSync(path.join(outDir, 'SETUP.bat'))).toBe(true);
      expect(fs.existsSync(path.join(outDir, 'SETUP.sh'))).toBe(true);

      const readme = fs.readFileSync(path.join(outDir, 'README.md'), 'utf-8');
      expect(readme).toContain('ToolForge Micro-SaaS Marketplace Engine');
      expect(readme).toContain('Licensed Student Edition');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('throws a descriptive error when requesting an invalid kit ID', () => {
    expect(() => {
      generateStarterKitZip('kit_non_existent');
    }).toThrowError(/not found/i);
  });
});
