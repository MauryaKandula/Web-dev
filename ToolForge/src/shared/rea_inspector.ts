/**
 * REA Inspector & Reverse-Engineering Engine
 * Reverse-engineered from S:\Work\AntiGravity\tools\rea (rea-agents)
 * Provides binary header analysis, entropy calculation, string extraction,
 * and JavaScript de-obfuscation utilities.
 */

export interface BinaryHeaderInfo {
  format: 'PE' | 'ELF' | 'Mach-O' | 'WASM' | 'ZIP_APK' | 'ASAR' | 'UNKNOWN';
  description: string;
  architecture?: 'x86_64' | 'x86' | 'ARM64' | 'WASM32' | 'Unknown';
  magicHex: string;
  isPackedOrEncrypted: boolean;
  entropy: number;
}

export interface ExtractedString {
  value: string;
  offset: number;
  kind: 'ascii' | 'url' | 'ip' | 'path' | 'secret_candidate';
}

export interface DeobfuscationResult {
  cleanedCode: string;
  unpackedStringsCount: number;
  detectedPatterns: string[];
}

/**
 * Calculates Shannon Entropy of an array of bytes (0.0 = completely uniform, 8.0 = completely random/encrypted)
 */
export function calculateShannonEntropy(bytes: Uint8Array): number {
  if (bytes.length === 0) return 0;

  const frequencies = new Map<number, number>();
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    frequencies.set(byte, (frequencies.get(byte) || 0) + 1);
  }

  let entropy = 0;
  const len = bytes.length;
  for (const count of frequencies.values()) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }

  return Math.round(entropy * 1000) / 1000;
}

/**
 * Analyzes binary magic bytes to identify executable / container format
 */
export function identifyBinaryHeader(bytes: Uint8Array): BinaryHeaderInfo {
  if (bytes.length < 4) {
    return {
      format: 'UNKNOWN',
      description: 'Insufficient byte length for header analysis',
      magicHex: '',
      isPackedOrEncrypted: false,
      entropy: 0
    };
  }

  const entropy = calculateShannonEntropy(bytes);
  const isPackedOrEncrypted = entropy > 7.2;

  const b0 = bytes[0];
  const b1 = bytes[1];
  const b2 = bytes[2];
  const b3 = bytes[3];

  const magicHex = [b0, b1, b2, b3]
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');

  // Windows PE (MZ)
  if (b0 === 0x4d && b1 === 0x5a) {
    return {
      format: 'PE',
      description: 'Windows Portable Executable (EXE/DLL/SYS)',
      architecture: 'x86_64',
      magicHex,
      isPackedOrEncrypted,
      entropy
    };
  }

  // Linux ELF (\x7FELF)
  if (b0 === 0x7f && b1 === 0x45 && b2 === 0x4c && b3 === 0x46) {
    const is64 = bytes.length > 4 && bytes[4] === 2;
    return {
      format: 'ELF',
      description: `Executable and Linkable Format (${is64 ? '64-bit' : '32-bit'})`,
      architecture: is64 ? 'x86_64' : 'x86',
      magicHex,
      isPackedOrEncrypted,
      entropy
    };
  }

  // WebAssembly (\x00asm)
  if (b0 === 0x00 && b1 === 0x61 && b2 === 0x73 && b3 === 0x6d) {
    return {
      format: 'WASM',
      description: 'WebAssembly Binary Module',
      architecture: 'WASM32',
      magicHex,
      isPackedOrEncrypted,
      entropy
    };
  }

  // ZIP / JAR / APK (PK\x03\x04)
  if (b0 === 0x50 && b1 === 0x4b && b2 === 0x03 && b3 === 0x04) {
    return {
      format: 'ZIP_APK',
      description: 'ZIP Compressed Container (APK / Electron Archive / JAR)',
      magicHex,
      isPackedOrEncrypted: true,
      entropy
    };
  }

  // Mach-O
  if (
    (b0 === 0xfe && b1 === 0xed && b2 === 0xfa && (b3 === 0xce || b3 === 0xcf)) ||
    (b0 === 0xcf && b1 === 0xfa && b2 === 0xed && b3 === 0xfe)
  ) {
    return {
      format: 'Mach-O',
      description: 'Apple Mach-O Binary Executable',
      architecture: 'ARM64',
      magicHex,
      isPackedOrEncrypted,
      entropy
    };
  }

  return {
    format: 'UNKNOWN',
    description: 'Generic Data / Unrecognized Magic Header',
    magicHex,
    isPackedOrEncrypted,
    entropy
  };
}

/**
 * Extracts printable ASCII and potential secrets from byte buffer
 */
export function extractStringsFromBytes(bytes: Uint8Array, minLength = 4): ExtractedString[] {
  const results: ExtractedString[] = [];
  let current: number[] = [];
  let startOffset = 0;

  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    // Printable ASCII 32 to 126
    if (b >= 32 && b <= 126) {
      if (current.length === 0) startOffset = i;
      current.push(b);
    } else {
      if (current.length >= minLength) {
        const str = String.fromCharCode(...current);
        let kind: ExtractedString['kind'] = 'ascii';

        if (/^https?:\/\//i.test(str)) {
          kind = 'url';
        } else if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(str)) {
          kind = 'ip';
        } else if (/^[A-Za-z]:\\[\w\s\\.-]+|\/[\w\s/.-]+/i.test(str)) {
          kind = 'path';
        } else if (/key|token|secret|password|bearer/i.test(str) && str.length > 12) {
          kind = 'secret_candidate';
        }

        results.push({ value: str, offset: startOffset, kind });
      }
      current = [];
    }
  }

  return results;
}

/**
 * De-obfuscates common JavaScript packing patterns (hex escape sequences, base64 strings)
 */
export function deobfuscateJavaScript(code: string): DeobfuscationResult {
  const patterns: string[] = [];
  let unpackedStrings = 0;

  // Unescape hex sequences e.g. \x68\x65\x6c\x6c\x6f -> hello
  let cleaned = code.replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) => {
    unpackedStrings++;
    if (!patterns.includes('Hex Escapes')) patterns.push('Hex Escapes');
    const charCode = parseInt(hex, 16);
    return charCode >= 32 && charCode <= 126 ? String.fromCharCode(charCode) : `\\x${hex}`;
  });

  // Unpack simple atob / Buffer.from base64 payloads
  cleaned = cleaned.replace(/atob\(['"]([A-Za-z0-9+/=]{8,})['"]\)/g, (_, b64) => {
    try {
      if (typeof atob === 'function') {
        const decoded = atob(b64);
        unpackedStrings++;
        if (!patterns.includes('Base64 atob() Payload')) patterns.push('Base64 atob() Payload');
        return JSON.stringify(decoded);
      }
    } catch {}
    return `atob("${b64}")`;
  });

  return {
    cleanedCode: cleaned,
    unpackedStringsCount: unpackedStrings,
    detectedPatterns: patterns
  };
}
