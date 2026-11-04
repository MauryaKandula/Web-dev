import { describe, it, expect } from 'vitest';
import {
  generateKaraokeTimings,
  formatSRT,
  exportProductionBriefMarkdown,
  cseScriptPresets
} from '../shared/creatorpipe.ts';

describe('CreatorPipe Technical Content & Scripting Engine', () => {
  const sampleScript = cseScriptPresets[0];

  it('generates word-by-word karaoke timestamps with key technical terms identified', () => {
    const text = 'Your Windows laptop is slow because of modified page lists and RAM cache.';
    const timings = generateKaraokeTimings(text, 0, 160);

    expect(timings.length).toBeGreaterThan(0);
    expect(timings[0].startMs).toBe(0);
    expect(timings[0].endMs).toBeGreaterThan(0);

    // Check key terms identified
    const ramChunk = timings.find((t) => t.word.toLowerCase().includes('ram'));
    const cacheChunk = timings.find((t) => t.word.toLowerCase().includes('cache'));
    expect(ramChunk?.isKeyTerm).toBe(true);
    expect(cacheChunk?.isKeyTerm).toBe(true);
  });

  it('formats multi-zone script into valid SubRip (SRT) format', () => {
    const srt = formatSRT(sampleScript);

    expect(srt).toContain('1\r\n00:00:00,000 -->');
    expect(srt).toContain(sampleScript.hook.speechHook);
    expect(srt).toContain(sampleScript.payoff.keyTakeaway);
  });

  it('generates production brief markdown with all 3 zones and visual cues', () => {
    const md = exportProductionBriefMarkdown(sampleScript);

    expect(md).toContain('# CreatorPipe Production Brief');
    expect(md).toContain('ZONE 1: THE 3-SECOND HOOK');
    expect(md).toContain('ZONE 2: THE TECHNICAL MECHANISM');
    expect(md).toContain('ZONE 3: THE PAYOFF & REPO CTA');
    expect(md).toContain('THUMBNAIL & VIRAL ASSET BRIEF');
    expect(md).toContain(sampleScript.thumbnailBrief.neonPillBadge);
  });

  it('includes high-quality pre-configured CSE scripts in presets', () => {
    expect(cseScriptPresets.length).toBeGreaterThanOrEqual(2);
    const ramScript = cseScriptPresets.find((s) => s.id === 'script_ram_trimmer');
    const dsaScript = cseScriptPresets.find((s) => s.id === 'script_interview_twosum');

    expect(ramScript).toBeDefined();
    expect(dsaScript).toBeDefined();
    expect(ramScript?.mechanismBeats.length).toBeGreaterThanOrEqual(3);
    expect(dsaScript?.mechanismBeats.length).toBeGreaterThanOrEqual(2);
  });
});
