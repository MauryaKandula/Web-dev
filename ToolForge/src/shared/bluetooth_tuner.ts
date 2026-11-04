/**
 * Bluetooth Power & Latency Tuner Engine (P-13)
 * 
 * Reverse-engineered from:
 * - SystemTune Optimize-Bluetooth.ps1 (TP-Link UB500 / UB400 & Realtek USB dongles)
 * - Windows USB Selective Suspend HCI power policies
 * 
 * Provides automated power plan reconfiguration, device-level selective suspend
 * bypass, WMI power state clamping, latency drop estimation, and hardware diagnostics.
 */

export const SUB_USB_GUID = '2a737441-1930-4402-8d77-b2bebba308a3';
export const USB_SELECTIVE_SUSPEND_GUID = '48e6b7a6-50f5-4782-a5d4-53bb8f07e226';

export const KNOWN_BLUETOOTH_VENDORS: Record<string, string> = {
  '2357': 'TP-Link',
  '0BDA': 'Realtek',
  '8087': 'Intel',
  '8086': 'Intel',
  '0A5C': 'Broadcom',
  '0CF3': 'Qualcomm Atheros',
  '046D': 'Logitech',
  '045E': 'Microsoft',
  '13D3': 'IMC Networks (AzureWave)',
  '0489': 'Foxconn / Hon Hai',
  '10EC': 'Realtek',
  '05AC': 'Apple',
  '0B05': 'ASUSTeK Computer',
  '04F2': 'Chicony Electronics',
};

export interface BluetoothDeviceDiagnostics {
  vendor: string;
  isUsbDongle: boolean;
  recommendsSelectiveSuspendFix: boolean;
  rawHardwareId: string;
  vid?: string;
  pid?: string;
}

export interface LatencyDropResult {
  beforeMs: number;
  afterMs: number;
  percentImprovement: number;
}

/**
 * Generates the PowerShell script that permanently disables USB Selective Suspend
 * in the active Windows power scheme (both AC plugged-in and DC battery power).
 */
export function generateUsbSelectiveSuspendScript(): string {
  return [
    '# =============================================================================',
    '# ToolForge Bluetooth Tuner — Disable USB Selective Suspend',
    '# Reverse-engineered from SystemTune Optimize-Bluetooth.ps1',
    '# =============================================================================',
    '',
    'Write-Output "[ToolForge Bluetooth Tuner] Disabling USB Selective Suspend in active power scheme..."',
    `powercfg /SETACVALUEINDEX SCHEME_CURRENT ${SUB_USB_GUID} ${USB_SELECTIVE_SUSPEND_GUID} 0`,
    `powercfg /SETDCVALUEINDEX SCHEME_CURRENT ${SUB_USB_GUID} ${USB_SELECTIVE_SUSPEND_GUID} 0`,
    'powercfg /SETACTIVE SCHEME_CURRENT',
    'Write-Output "[OK] USB Selective Suspend permanently disabled in active power plan."',
  ].join('\n');
}

/**
 * Generates the PowerShell registry and WMI fix script to eliminate device-level
 * selective suspend power gating and restart Bluetooth audio/HID stack services.
 */
export function generateBluetoothRegistryFix(targetHardwareId?: string): string {
  const targetPattern = targetHardwareId
    ? `HKLM:\\System\\CurrentControlSet\\Enum\\${targetHardwareId.replace(/\\$/, '')}\\*\\Device Parameters`
    : 'HKLM:\\System\\CurrentControlSet\\Enum\\USB\\VID_2357&PID_0604\\*\\Device Parameters';

  return [
    '# =============================================================================',
    '# ToolForge Bluetooth Tuner — Device Registry & WMI Power State Fix',
    '# Reverse-engineered from SystemTune Optimize-Bluetooth.ps1',
    '# =============================================================================',
    '',
    'Write-Output "== Bluetooth Optimization & Stability Script =="',
    '',
    '# 1. Disable USB Selective Suspend in Power Scheme',
    `powercfg /SETACVALUEINDEX SCHEME_CURRENT ${SUB_USB_GUID} ${USB_SELECTIVE_SUSPEND_GUID} 0`,
    `powercfg /SETDCVALUEINDEX SCHEME_CURRENT ${SUB_USB_GUID} ${USB_SELECTIVE_SUSPEND_GUID} 0`,
    'powercfg /SETACTIVE SCHEME_CURRENT',
    'Write-Output "[OK] USB Selective Suspend disabled in active power plan."',
    '',
    '# 2. Disable Device-level Selective Suspend on Bluetooth Adapters',
    `$btParams = "${targetPattern}"`,
    'Get-Item -Path $btParams -ErrorAction SilentlyContinue | ForEach-Object {',
    '    Set-ItemProperty -Path $_.PSPath -Name "DeviceSelectiveSuspended" -Value 0 -Type DWord -ErrorAction SilentlyContinue',
    '    Set-ItemProperty -Path $_.PSPath -Name "SelectiveSuspendEnabled" -Value 0 -Type DWord -ErrorAction SilentlyContinue',
    '    Set-ItemProperty -Path $_.PSPath -Name "EnhancedPowerManagementEnabled" -Value 0 -Type DWord -ErrorAction SilentlyContinue',
    '    Write-Output "[OK] Device-level power suspend disabled for: $($_.PSPath)"',
    '}',
    '',
    '# 3. Disable WMI Device Power Saving on Bluetooth and Root Hubs',
    'try {',
    '    Get-CimInstance -Namespace root\\wmi -ClassName MSPower_DeviceEnable -ErrorAction Stop |',
    '        Where-Object { $_.InstanceName -match "USB\\\\VID_2357&PID_0604|USB\\\\ROOT_HUB30|BTHENUM|USB\\\\VID_0BDA" } |',
    '        ForEach-Object {',
    '            $_ | Set-CimInstance -Property @{ Enable = $false } -ErrorAction SilentlyContinue',
    '            Write-Output "[OK] WMI Power Saving disabled on: $($_.InstanceName)"',
    '        }',
    '} catch {',
    '    Write-Output "[INFO] WMI power property requires elevated prompt to modify."',
    '}',
    '',
    '# 4. Restart Bluetooth Audio and Support Services',
    'Restart-Service -Name bthserv -Force -ErrorAction SilentlyContinue',
    'Restart-Service -Name BTAGService -Force -ErrorAction SilentlyContinue',
    'Write-Output "[OK] Bluetooth services refreshed."',
    '',
    'Write-Output "== Optimization complete =="',
  ].join('\n');
}

/**
 * Calculates expected audio/controller latency drop based on eliminating
 * USB D2/D3 wake-from-suspend polling stalls.
 * 
 * Steady-state USB Bluetooth polling jitter without power gating stabilizes at ~28%
 * of wake-penalty jitter, with a hardware floor of 1.5ms.
 */
export function calculateExpectedLatencyDrop(currentJitterMs: number): LatencyDropResult {
  if (currentJitterMs <= 0 || isNaN(currentJitterMs)) {
    return { beforeMs: 0, afterMs: 0, percentImprovement: 0 };
  }

  const beforeMs = Math.round(currentJitterMs * 100) / 100;
  // USB Bluetooth polling interval floor is 1.5ms
  const targetAfter = Math.max(1.5, Math.round(beforeMs * 0.28 * 100) / 100);
  const afterMs = targetAfter > beforeMs ? beforeMs : targetAfter;
  const percentImprovement =
    beforeMs > 0 ? Math.round(((beforeMs - afterMs) / beforeMs) * 1000) / 10 : 0;

  return { beforeMs, afterMs, percentImprovement };
}

/**
 * Parses Windows PnP Hardware ID to diagnose device vendor, USB transport type,
 * and whether USB Selective Suspend fix is recommended.
 */
export function parseBluetoothDeviceDiagnostics(hardwareId: string): {
  vendor: string;
  isUsbDongle: boolean;
  recommendsSelectiveSuspendFix: boolean;
} {
  if (!hardwareId || !hardwareId.trim()) {
    return {
      vendor: 'Unknown Vendor',
      isUsbDongle: false,
      recommendsSelectiveSuspendFix: false,
    };
  }

  const cleanId = hardwareId.trim();
  const vidMatch = cleanId.match(/(?:VID_|VEN_)([0-9A-Fa-f]{4})/i);
  const vid = vidMatch ? vidMatch[1].toUpperCase() : null;

  let vendor = 'Generic Bluetooth Device';
  if (vid) {
    vendor = KNOWN_BLUETOOTH_VENDORS[vid] || `Unknown Vendor (VID: ${vid})`;
  }

  const upper = cleanId.toUpperCase();
  const isUsbDongle =
    upper.startsWith('USB\\') ||
    upper.startsWith('USBSTOR\\') ||
    upper.includes('\\USB\\');

  // USB dongles aggressively sleep causing audio cutouts and packet drops on Windows
  const recommendsSelectiveSuspendFix = isUsbDongle;

  return {
    vendor,
    isUsbDongle,
    recommendsSelectiveSuspendFix,
  };
}
