import { describe, it, expect } from 'vitest';
import crypto from 'node:crypto';
import { PrivateStorageProvider } from '../server/services/storage.ts';

describe('ToolForge PrivateStorageProvider Security & Quarantine', () => {
  it('allows safe archive and script packages (.zip, .tar.gz, .json, .py)', () => {
    expect(PrivateStorageProvider.validateUpload('turboregex-v1.2.zip', 1024 * 50).valid).toBe(true);
    expect(PrivateStorageProvider.validateUpload('prompt_matrix.json', 1024 * 2).valid).toBe(true);
    expect(PrivateStorageProvider.validateUpload('scraper.py', 1024 * 10).valid).toBe(true);
  });

  it('blocks dangerous executable binary extensions (.exe, .bat, .cmd, .vbs, .msi, .scr)', () => {
    const dangerous = ['malware.exe', 'setup.msi', 'payload.bat', 'script.cmd', 'macro.vbs', 'screen.scr'];
    for (const file of dangerous) {
      const res = PrivateStorageProvider.validateUpload(file, 1024);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('restricted');
    }
  });

  it('enforces maximum 100MB upload file limit', () => {
    const overLimit = 101 * 1024 * 1024;
    const res = PrivateStorageProvider.validateUpload('large_dataset.zip', overLimit);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('exceeds maximum');
  });

  it('rejects invalid sizes and filenames containing paths', () => {
    expect(PrivateStorageProvider.validateUpload('tool.zip', -1).valid).toBe(false);
    expect(PrivateStorageProvider.validateUpload('..\\outside.zip', 10).valid).toBe(false);
  });

  it('does not invent a package when no real file is stored', () => {
    expect(PrivateStorageProvider.getDownloadPath(`missing-${crypto.randomUUID()}.zip`)).toBeNull();
  });

  it('rejects paths outside the private storage folder', () => {
    expect(PrivateStorageProvider.getDownloadPath('..\\outside.zip')).toBeNull();
    expect(PrivateStorageProvider.getDownloadPath('../outside.zip')).toBeNull();
  });
});
