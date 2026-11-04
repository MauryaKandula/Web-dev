import { describe, it, expect } from 'vitest';
import {
  generateUsbSelectiveSuspendScript,
  generateBluetoothRegistryFix,
  calculateExpectedLatencyDrop,
  parseBluetoothDeviceDiagnostics,
  SUB_USB_GUID,
  USB_SELECTIVE_SUSPEND_GUID,
  KNOWN_BLUETOOTH_VENDORS,
} from '../shared/bluetooth_tuner.ts';
import { validatePowerShellSyntax } from '../shared/win11debloat.ts';

describe('Bluetooth Power & Latency Tuner Engine (P-13) Unit Tests', () => {
  it('generates a valid powercfg script that permanently disables USB Selective Suspend in active power scheme', () => {
    const script = generateUsbSelectiveSuspendScript();

    expect(script).toContain('powercfg /SETACVALUEINDEX SCHEME_CURRENT');
    expect(script).toContain('powercfg /SETDCVALUEINDEX SCHEME_CURRENT');
    expect(script).toContain(SUB_USB_GUID);
    expect(script).toContain(USB_SELECTIVE_SUSPEND_GUID);
    expect(script).toContain('powercfg /SETACTIVE SCHEME_CURRENT');

    const syntax = validatePowerShellSyntax(script);
    expect(syntax.valid).toBe(true);
    expect(syntax.commands).toContain('powercfg');
    expect(syntax.commands).toContain('Write-Output');
  });

  it('generates a complete Bluetooth device registry, WMI power state, and service refresh fix', () => {
    const script = generateBluetoothRegistryFix();

    // Registry keys for selective suspend
    expect(script).toContain('DeviceSelectiveSuspended');
    expect(script).toContain('SelectiveSuspendEnabled');
    expect(script).toContain('EnhancedPowerManagementEnabled');

    // WMI power management suppression
    expect(script).toContain('MSPower_DeviceEnable');
    expect(script).toContain('Enable = $false');

    // Bluetooth stack service restarts
    expect(script).toContain('Restart-Service -Name bthserv');
    expect(script).toContain('Restart-Service -Name BTAGService');

    const syntax = validatePowerShellSyntax(script);
    expect(syntax.valid).toBe(true);
    expect(syntax.commands).toContain('Set-ItemProperty');
    expect(syntax.commands).toContain('Restart-Service');
    expect(syntax.commands).toContain('Get-CimInstance');
  });

  it('allows customizing target hardware device path for registry fixes', () => {
    const customHardware = 'USB\\VID_0BDA&PID_8771';
    const script = generateBluetoothRegistryFix(customHardware);

    expect(script).toContain(customHardware);
    const syntax = validatePowerShellSyntax(script);
    expect(syntax.valid).toBe(true);
  });

  it('calculates expected latency drop and percent improvement accurately for active jitter measurements', () => {
    const highJitter = calculateExpectedLatencyDrop(40);
    expect(highJitter.beforeMs).toBe(40);
    expect(highJitter.afterMs).toBe(11.2);
    expect(highJitter.percentImprovement).toBe(72);

    const moderateJitter = calculateExpectedLatencyDrop(25);
    expect(moderateJitter.beforeMs).toBe(25);
    expect(moderateJitter.afterMs).toBe(7);
    expect(moderateJitter.percentImprovement).toBe(72);

    const lowJitter = calculateExpectedLatencyDrop(10);
    expect(lowJitter.beforeMs).toBe(10);
    expect(lowJitter.afterMs).toBe(2.8);
    expect(lowJitter.percentImprovement).toBe(72);
  });

  it('handles latency calculation boundary cases, zero, and negative values safely', () => {
    const zero = calculateExpectedLatencyDrop(0);
    expect(zero).toEqual({ beforeMs: 0, afterMs: 0, percentImprovement: 0 });

    const negative = calculateExpectedLatencyDrop(-15);
    expect(negative).toEqual({ beforeMs: 0, afterMs: 0, percentImprovement: 0 });

    const nanVal = calculateExpectedLatencyDrop(NaN);
    expect(nanVal).toEqual({ beforeMs: 0, afterMs: 0, percentImprovement: 0 });

    // When current jitter is already low, afterMs should not exceed beforeMs
    const tinyJitter = calculateExpectedLatencyDrop(1.2);
    expect(tinyJitter.beforeMs).toBe(1.2);
    expect(tinyJitter.afterMs).toBeLessThanOrEqual(1.2);
    expect(tinyJitter.percentImprovement).toBeGreaterThanOrEqual(0);
  });

  it('correctly parses TP-Link Bluetooth USB dongle diagnostics (SystemTune reverse engineering)', () => {
    // Sourced from Optimize-Bluetooth.ps1 VID_2357&PID_0604 (TP-Link UB500)
    const tplinkId = 'USB\\VID_2357&PID_0604\\000000000001';
    const diag = parseBluetoothDeviceDiagnostics(tplinkId);

    expect(diag.vendor).toBe('TP-Link');
    expect(diag.isUsbDongle).toBe(true);
    expect(diag.recommendsSelectiveSuspendFix).toBe(true);
  });

  it('correctly identifies vendor profiles and distinguishes USB dongles from internal PCIe adapters', () => {
    // Realtek USB dongle
    const realtekDiag = parseBluetoothDeviceDiagnostics('USB\\VID_0BDA&PID_8771\\0123456789ABCDEF');
    expect(realtekDiag.vendor).toBe('Realtek');
    expect(realtekDiag.isUsbDongle).toBe(true);
    expect(realtekDiag.recommendsSelectiveSuspendFix).toBe(true);

    // Intel PCIe Internal Wi-Fi / Bluetooth
    const intelPcieDiag = parseBluetoothDeviceDiagnostics('PCI\\VEN_8086&DEV_2723&SUBSYS_00848086');
    expect(intelPcieDiag.vendor).toBe('Intel');
    expect(intelPcieDiag.isUsbDongle).toBe(false);
    expect(intelPcieDiag.recommendsSelectiveSuspendFix).toBe(false);

    // Broadcom USB dongle
    const broadcomDiag = parseBluetoothDeviceDiagnostics('USB\\VID_0A5C&PID_21E8\\1234');
    expect(broadcomDiag.vendor).toBe('Broadcom');
    expect(broadcomDiag.isUsbDongle).toBe(true);
    expect(broadcomDiag.recommendsSelectiveSuspendFix).toBe(true);

    // Generic Bluetooth Enumeration
    const genericDiag = parseBluetoothDeviceDiagnostics('BTHENUM\\{0000110b-0000-1000-8000-00805f9b34fb}');
    expect(genericDiag.vendor).toBe('Generic Bluetooth Device');
    expect(genericDiag.isUsbDongle).toBe(false);
    expect(genericDiag.recommendsSelectiveSuspendFix).toBe(false);

    // Unknown VID
    const unknownDiag = parseBluetoothDeviceDiagnostics('USB\\VID_9999&PID_1234\\ABC');
    expect(unknownDiag.vendor).toBe('Unknown Vendor (VID: 9999)');
    expect(unknownDiag.isUsbDongle).toBe(true);
    expect(unknownDiag.recommendsSelectiveSuspendFix).toBe(true);

    // Empty string
    const emptyDiag = parseBluetoothDeviceDiagnostics('');
    expect(emptyDiag.vendor).toBe('Unknown Vendor');
    expect(emptyDiag.isUsbDongle).toBe(false);
    expect(emptyDiag.recommendsSelectiveSuspendFix).toBe(false);
  });
});
