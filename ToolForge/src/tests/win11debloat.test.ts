import { describe, it, expect } from 'vitest';
import {
  generateDebloatScript,
  getBloatwarePackages,
  getTelemetryRegistryKeys,
  validatePowerShellSyntax,
  BLOATWARE_PACKAGES,
  TELEMETRY_REGISTRY_SETTINGS,
} from '../shared/win11debloat.ts';

describe('Win11Debloat Engine (P-12) Unit Tests', () => {
  it('returns a comprehensive catalog of verified bloatware packages with metadata', () => {
    const packages = getBloatwarePackages();
    expect(packages.length).toBeGreaterThanOrEqual(25);

    const candyCrush = packages.find((p) => p.packageId === 'king.com.CandyCrushSaga');
    expect(candyCrush).toBeDefined();
    expect(candyCrush?.category).toBe('consumer');
    expect(candyCrush?.safeToRemove).toBe(true);

    const cortana = packages.find((p) => p.packageId === 'Microsoft.549981C3F5F10');
    expect(cortana).toBeDefined();
    expect(cortana?.category).toBe('telemetry');

    const hpBloat = packages.find((p) => p.packageId === 'AD2F1837.myHP');
    expect(hpBloat).toBeDefined();
    expect(hpBloat?.category).toBe('oem');

    // Ensure all packages have valid profile recommendations
    for (const pkg of packages) {
      expect(pkg.recommendedProfiles.length).toBeGreaterThan(0);
      expect(['consumer', 'gaming', 'media', 'oem', 'productivity', 'social', 'telemetry']).toContain(
        pkg.category
      );
    }
  });

  it('provides verified telemetry registry keys matching Windows 11 enterprise policies', () => {
    const keys = getTelemetryRegistryKeys();
    expect(keys.length).toBeGreaterThanOrEqual(15);

    const allowTelemetry = keys.find((k) => k.name === 'AllowTelemetry');
    expect(allowTelemetry).toBeDefined();
    expect(allowTelemetry?.path).toBe(
      'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\DataCollection'
    );
    expect(allowTelemetry?.value).toBe(0);

    const advInfo = keys.find((k) => k.name === 'Enabled');
    expect(advInfo).toBeDefined();
    expect(advInfo?.path).toContain('AdvertisingInfo');
    expect(advInfo?.value).toBe(0);

    const edgeDiag = keys.find((k) => k.name === 'DiagnosticData');
    expect(edgeDiag).toBeDefined();
    expect(edgeDiag?.path).toBe('HKLM:\\SOFTWARE\\Policies\\Microsoft\\Edge');
  });

  it('generates a syntactically valid "minimal" debloat script without intrusive gaming tweaks', () => {
    const script = generateDebloatScript('minimal');
    expect(script).toContain('Win11Debloat Automation Script — Profile: [MINIMAL]');
    expect(script).toContain('AllowTelemetry');
    expect(script).toContain('DisableSearchBoxSuggestions');
    // Minimal does not disable GameDVR or aggressively tune gaming responsiveness
    expect(script).not.toContain('GameDVR_Enabled');
    expect(script).not.toContain('NetworkThrottlingIndex');

    const syntax = validatePowerShellSyntax(script);
    expect(syntax.valid).toBe(true);
    expect(syntax.lineCount).toBeGreaterThan(30);
    expect(syntax.commands).toContain('Set-ItemProperty');
    expect(syntax.commands).toContain('Remove-AppxPackage');
  });

  it('generates a high-performance "gaming" debloat script with low-latency optimizations', () => {
    const script = generateDebloatScript('gaming');
    expect(script).toContain('Profile: [GAMING]');
    // Gaming includes GameDVR and latency optimizations
    expect(script).toContain('GameDVR_Enabled');
    expect(script).toContain('AppCaptureEnabled');
    expect(script).toContain('NetworkThrottlingIndex');
    expect(script).toContain('SystemResponsiveness');
    expect(script).toContain('SysMain');

    const syntax = validatePowerShellSyntax(script);
    expect(syntax.valid).toBe(true);
    expect(syntax.commands).toContain('Set-ItemProperty');
    expect(syntax.commands).toContain('Set-Service');
  });

  it('generates an "ultimate_dev" script with developer enhancements and AI suppression', () => {
    const script = generateDebloatScript('ultimate_dev');
    expect(script).toContain('Profile: [ULTIMATE_DEV]');
    // Ultimate Dev configures explorer developer features
    expect(script).toContain('HideFileExt');
    expect(script).toContain('Hidden');
    expect(script).toContain('TaskbarEndTask');
    expect(script).toContain('TurnOffWindowsCopilot');

    const syntax = validatePowerShellSyntax(script);
    expect(syntax.valid).toBe(true);
    expect(syntax.commands).toContain('Remove-AppxPackage');
  });

  it('honors granular script generation options overriding profile defaults', () => {
    // Override minimal profile with copilot removal and gaming optimizations, but keep bing
    const script = generateDebloatScript('minimal', {
      removeCopilot: true,
      optimizeGamingServices: true,
      disableBingSearch: false,
    });

    expect(script).toContain('TurnOffWindowsCopilot');
    expect(script).toContain('GameDVR_Enabled');
    expect(script).not.toContain('DisableSearchBoxSuggestions');

    const syntax = validatePowerShellSyntax(script);
    expect(syntax.valid).toBe(true);
  });

  it('accurately validates PowerShell syntax and detects syntax errors', () => {
    // Valid snippet
    const validSnippet = `
      Write-Output "Starting setup..."
      if (Test-Path "HKCU:\\Software\\Test") {
          Set-ItemProperty -Path "HKCU:\\Software\\Test" -Name "Val" -Value 1 -Type DWord
      }
    `;
    const validRes = validatePowerShellSyntax(validSnippet);
    expect(validRes.valid).toBe(true);
    expect(validRes.commands).toEqual(['Set-ItemProperty', 'Test-Path', 'Write-Output']);

    // Empty script
    expect(validatePowerShellSyntax('').valid).toBe(false);
    expect(validatePowerShellSyntax('   \n  \t  ').valid).toBe(false);

    // Unbalanced brackets
    const unclosedBrace = 'if ($true) { Write-Output "test"';
    expect(validatePowerShellSyntax(unclosedBrace).valid).toBe(false);

    // Unclosed quote
    const unclosedQuote = 'Write-Output "missing quote';
    expect(validatePowerShellSyntax(unclosedQuote).valid).toBe(false);

    // Trailing dangling pipe
    const trailingPipe = 'Get-Service -Name DiagTrack |';
    expect(validatePowerShellSyntax(trailingPipe).valid).toBe(false);
  });
});
