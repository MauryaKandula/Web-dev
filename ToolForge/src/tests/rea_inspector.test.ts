import { describe, it, expect } from 'vitest';
import {
  calculateShannonEntropy,
  identifyBinaryHeader,
  extractStringsFromBytes,
  deobfuscateJavaScript
} from '../shared/rea_inspector.ts';

describe('REA Reverse-Engineering Inspector', () => {
  it('correctly calculates Shannon entropy for uniform vs random bytes', () => {
    // Completely uniform zeroes
    const uniform = new Uint8Array(100).fill(0);
    expect(calculateShannonEntropy(uniform)).toBe(0);

    // Highly varied / pseudo-random distribution
    const randomLike = new Uint8Array(256);
    for (let i = 0; i < 256; i++) randomLike[i] = i;
    const entropy = calculateShannonEntropy(randomLike);
    expect(entropy).toBe(8); // Maximum possible 8.0 bits per byte
  });

  it('identifies Windows PE executable header', () => {
    const peHeader = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00]);
    const info = identifyBinaryHeader(peHeader);
    expect(info.format).toBe('PE');
    expect(info.description).toContain('Windows Portable Executable');
    expect(info.magicHex).toBe('4D 5A 90 00');
  });

  it('identifies Linux ELF binary header', () => {
    const elfHeader = new Uint8Array([0x7f, 0x45, 0x4c, 0x46, 0x02]); // ELF 64-bit
    const info = identifyBinaryHeader(elfHeader);
    expect(info.format).toBe('ELF');
    expect(info.architecture).toBe('x86_64');
  });

  it('identifies WebAssembly binary header', () => {
    const wasmHeader = new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]);
    const info = identifyBinaryHeader(wasmHeader);
    expect(info.format).toBe('WASM');
    expect(info.architecture).toBe('WASM32');
  });

  it('extracts strings and categorizes URLs and paths accurately', () => {
    const encoder = new TextEncoder();
    const str1 = 'https://toolforge.dev/api';
    const str2 = 'C:\\ProgramData\\NVIDIA\\config.json';
    const rawBytes = new Uint8Array([
      0, 0,
      ...encoder.encode(str1),
      0,
      ...encoder.encode(str2),
      0, 0
    ]);

    const extracted = extractStringsFromBytes(rawBytes, 4);
    expect(extracted.length).toBe(2);
    expect(extracted[0].kind).toBe('url');
    expect(extracted[0].value).toBe(str1);
    expect(extracted[1].kind).toBe('path');
    expect(extracted[1].value).toBe(str2);
  });

  it('de-obfuscates hex escape sequences in JavaScript', () => {
    const obfuscated = 'const greeting = "\\x48\\x65\\x6c\\x6c\\x6f\\x20\\x57\\x6f\\x72\\x6c\\x64";';
    const result = deobfuscateJavaScript(obfuscated);
    expect(result.cleanedCode).toContain('"Hello World"');
    expect(result.unpackedStringsCount).toBe(11);
    expect(result.detectedPatterns).toContain('Hex Escapes');
  });
});
