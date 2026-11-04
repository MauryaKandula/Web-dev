import path from 'node:path';
import fs from 'node:fs';

const STORAGE_DIR = path.resolve('data/private_storage');
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

export interface StoredFileMetadata {
  filename: string;
  sizeKb: number;
  mimeType: string;
  sha256Hash: string;
  scanStatus: 'clean' | 'scanning' | 'flagged';
}

export class PrivateStorageProvider {
  /**
   * Return only a real file stored directly in private storage. Never synthesize
   * placeholder package contents or follow symlinks outside the storage folder.
   */
  static getDownloadPath(filename: string): string | null {
    if (!filename || path.basename(filename) !== filename || filename === '.' || filename === '..') {
      return null;
    }

    const candidate = path.resolve(STORAGE_DIR, filename);
    if (path.dirname(candidate) !== STORAGE_DIR) return null;

    try {
      const info = fs.lstatSync(candidate);
      if (!info.isFile()) return null;
      const realPath = fs.realpathSync(candidate);
      if (path.dirname(realPath) !== fs.realpathSync(STORAGE_DIR)) return null;
      return realPath;
    } catch {
      return null;
    }
  }

  static validateUpload(filename: string, sizeBytes: number): { valid: boolean; error?: string } {
    const MAX_SIZE = 100 * 1024 * 1024; // 100MB
    if (!Number.isSafeInteger(sizeBytes) || sizeBytes < 0) {
      return { valid: false, error: 'File size is invalid' };
    }
    if (sizeBytes > MAX_SIZE) {
      return { valid: false, error: 'File exceeds maximum allowed upload size of 100MB' };
    }
    if (!filename || path.basename(filename) !== filename || filename === '.' || filename === '..') {
      return { valid: false, error: 'File name must be a plain name without a path' };
    }

    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.vbs', '.msi', '.scr'];
    const ext = path.extname(filename).toLowerCase();
    if (dangerousExtensions.includes(ext)) {
      return { valid: false, error: 'Direct executable binaries are restricted. Please package within .zip or .tar.gz archive.' };
    }

    return { valid: true };
  }
}
