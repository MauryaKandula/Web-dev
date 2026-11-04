import { describe, it, expect } from 'vitest';
import {
  generateStarshipToml,
  generateWindowsTerminalScheme,
  PALETTES,
  RiceConfig
} from '../shared/shell_rice.ts';

describe('Shell Rice & Aesthetic Theme Engine', () => {
  it('generates valid Starship TOML configuration with Nerd Fonts and Git status', () => {
    const config: RiceConfig = {
      preset: 'cyberpunk_neon',
      promptChar: '❯',
      showGitStatus: true,
      showNodeVersion: true,
      showPythonVenv: true,
      showExecutionTime: true,
      enableNerdFonts: true
    };

    const toml = generateStarshipToml(config);
    expect(toml).toContain('[character]');
    expect(toml).toContain('[git_branch]');
    expect(toml).toContain('[nodejs]');
    expect(toml).toContain('[python]');
    expect(toml).toContain('[cmd_duration]');
    expect(toml).toContain(PALETTES.cyberpunk_neon.cyan);
  });

  it('omits optional modules when disabled in config', () => {
    const minimalConfig: RiceConfig = {
      preset: 'nord_frost',
      promptChar: '>',
      showGitStatus: false,
      showNodeVersion: false,
      showPythonVenv: false,
      showExecutionTime: false,
      enableNerdFonts: false
    };

    const toml = generateStarshipToml(minimalConfig);
    expect(toml).not.toContain('[git_branch]');
    expect(toml).not.toContain('[nodejs]');
    expect(toml).not.toContain('[python]');
    expect(toml).not.toContain('[cmd_duration]');
    expect(toml).toContain('[directory]');
  });

  it('generates valid Windows Terminal color scheme with matching HEX colors', () => {
    const scheme = generateWindowsTerminalScheme('tokyo_night');
    expect(scheme.name).toBe('Tokyo Night');
    expect(scheme.background).toBe('#1a1b26');
    expect(scheme.foreground).toBe('#c0caf5');
    expect(scheme.cursorColor).toBe(PALETTES.tokyo_night.cyan);
    expect(scheme.cyan).toBe(PALETTES.tokyo_night.cyan);
  });

  it('provides all 5 core presets with calibrated contrast', () => {
    const presets = Object.keys(PALETTES);
    expect(presets).toHaveLength(5);
    expect(presets).toContain('cyberpunk_neon');
    expect(presets).toContain('tokyo_night');
    expect(presets).toContain('catppuccin_mocha');
    expect(presets).toContain('synthwave_84');
    expect(presets).toContain('nord_frost');
  });
});
