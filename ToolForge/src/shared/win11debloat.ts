/**
 * Win11Debloat Engine (P-12)
 * 
 * Reverse-engineered from:
 * - Win11Debloat (Freezer/Raphire)
 * - Sophia-Script for Windows 11
 * 
 * Implements production-grade Windows 11 bloatware removal, diagnostic
 * telemetry purging, background AI/Copilot suppression, and gaming latency tuning.
 */

export type DebloatProfile = 'minimal' | 'gaming' | 'ultimate_dev';

export type BloatCategory =
  | 'telemetry'
  | 'gaming'
  | 'oem'
  | 'consumer'
  | 'media'
  | 'productivity'
  | 'social';

export interface BloatPackage {
  name: string;
  packageId: string;
  category: BloatCategory;
  safeToRemove: boolean;
  recommendedProfiles: DebloatProfile[];
  description: string;
}

export interface TelemetrySetting {
  path: string;
  name: string;
  value: number | string;
  description: string;
  recommendedProfiles: DebloatProfile[];
}

export interface ServiceConfig {
  name: string;
  displayName: string;
  startupType: 'Disabled' | 'Manual' | 'Automatic';
  description: string;
  targetProfiles: DebloatProfile[];
}

export interface DebloatScriptOptions {
  removeCopilot?: boolean;
  disableTelemetry?: boolean;
  optimizeGamingServices?: boolean;
  disableBingSearch?: boolean;
}

export interface PowerShellSyntaxResult {
  valid: boolean;
  lineCount: number;
  commands: string[];
}

/**
 * Verified Windows 11 AppX Bloatware Catalog
 * Sourced directly from Win11Debloat Apps.json and Sophia-Script definitions.
 */
export const BLOATWARE_PACKAGES: BloatPackage[] = [
  // Consumer / Advertised Pre-installs
  {
    name: 'Candy Crush Saga',
    packageId: 'king.com.CandyCrushSaga',
    category: 'consumer',
    safeToRemove: true,
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
    description: 'Pre-installed King sponsored casual game with telemetry beaconing.',
  },
  {
    name: 'Candy Crush Soda Saga',
    packageId: 'king.com.CandyCrushSodaSaga',
    category: 'consumer',
    safeToRemove: true,
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
    description: 'Sponsored third-party game preloaded via Microsoft Consumer Experience.',
  },
  {
    name: 'TikTok',
    packageId: 'BytedancePte.Ltd.TikTok',
    category: 'social',
    safeToRemove: true,
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
    description: 'Sponsored PWA stub application.',
  },
  {
    name: 'Instagram',
    packageId: 'Facebook.Instagram',
    category: 'social',
    safeToRemove: true,
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
    description: 'Sponsored social media application package.',
  },
  {
    name: 'Disney+',
    packageId: 'Disney.37853FC22B2CE',
    category: 'media',
    safeToRemove: true,
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
    description: 'Pre-installed streaming entertainment portal.',
  },
  {
    name: 'Amazon Prime Video',
    packageId: 'AmazonVideo.PrimeVideo',
    category: 'media',
    safeToRemove: true,
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
    description: 'Sponsored streaming media application.',
  },
  {
    name: 'Spotify Music',
    packageId: 'SpotifyAB.SpotifyMusic',
    category: 'media',
    safeToRemove: true,
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
    description: 'Pre-installed OEM streaming music client.',
  },

  // Microsoft MSN & Bing Suite
  {
    name: 'Microsoft News',
    packageId: 'Microsoft.BingNews',
    category: 'consumer',
    safeToRemove: true,
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
    description: 'MSN News aggregation app with periodic background ad downloads.',
  },
  {
    name: 'MSN Weather',
    packageId: 'Microsoft.BingWeather',
    category: 'consumer',
    safeToRemove: true,
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
    description: 'MSN Weather service client and widget data provider.',
  },
  {
    name: 'MSN Money / Finance',
    packageId: 'Microsoft.BingFinance',
    category: 'consumer',
    safeToRemove: true,
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
    description: 'Financial news and stock tracker background service.',
  },
  {
    name: 'MSN Sports',
    packageId: 'Microsoft.BingSports',
    category: 'consumer',
    safeToRemove: true,
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
    description: 'Sports score tracker with live tile/widget telemetry.',
  },

  // Telemetry & Feedback Apps
  {
    name: 'Cortana Voice Assistant',
    packageId: 'Microsoft.549981C3F5F10',
    category: 'telemetry',
    safeToRemove: true,
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
    description: 'Deprecated voice assistant that maintains background listening hooks.',
  },
  {
    name: 'Feedback Hub',
    packageId: 'Microsoft.WindowsFeedbackHub',
    category: 'telemetry',
    safeToRemove: true,
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
    description: 'Telemetry feedback submission framework and diagnostic collector.',
  },
  {
    name: 'Get Help',
    packageId: 'Microsoft.GetHelp',
    category: 'telemetry',
    safeToRemove: true,
    recommendedProfiles: ['gaming', 'ultimate_dev'],
    description: 'Online support assistant and automated diagnostics launcher.',
  },
  {
    name: 'Tips / Get Started',
    packageId: 'Microsoft.Getstarted',
    category: 'consumer',
    safeToRemove: true,
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
    description: 'Windows promotional tips, notifications, and feature advertisements.',
  },
  {
    name: 'Windows Copilot AI Hub',
    packageId: 'Microsoft.Windows.AIHub',
    category: 'telemetry',
    safeToRemove: true,
    recommendedProfiles: ['gaming', 'ultimate_dev'],
    description: 'Copilot system UI hub and cloud-based AI reasoning integration layer.',
  },
  {
    name: 'Windows Widgets Platform',
    packageId: 'MicrosoftWindows.Client.WebExperience',
    category: 'consumer',
    safeToRemove: true,
    recommendedProfiles: ['gaming', 'ultimate_dev'],
    description: 'Taskbar widgets board powered by Edge WebView2 and MSN feed.',
  },

  // Media & 3D Redundant Packages
  {
    name: '3D Builder',
    packageId: 'Microsoft.3DBuilder',
    category: 'media',
    safeToRemove: true,
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
    description: 'Legacy 3D modeling and printing software.',
  },
  {
    name: 'Clipchamp Video Editor',
    packageId: 'Clipchamp.Clipchamp',
    category: 'media',
    safeToRemove: true,
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
    description: 'Cloud-dependent video editor bundle with subscription prompts.',
  },
  {
    name: 'Films & TV (Zune Video)',
    packageId: 'Microsoft.ZuneVideo',
    category: 'media',
    safeToRemove: true,
    recommendedProfiles: ['gaming', 'ultimate_dev'],
    description: 'Legacy video player superseded by Media Player.',
  },
  {
    name: 'Groove Music (Zune Music)',
    packageId: 'Microsoft.ZuneMusic',
    category: 'media',
    safeToRemove: true,
    recommendedProfiles: ['gaming'],
    description: 'Legacy audio player component.',
  },

  // Gaming-Specific Packages (Optional for minimal, removed in ultimate_dev/gaming if desired)
  {
    name: 'Microsoft Solitaire Collection',
    packageId: 'Microsoft.MicrosoftSolitaireCollection',
    category: 'gaming',
    safeToRemove: true,
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
    description: 'Ad-supported casual card suite with cloud telemetry.',
  },
  {
    name: 'Xbox App',
    packageId: 'Microsoft.XboxApp',
    category: 'gaming',
    safeToRemove: true,
    recommendedProfiles: ['ultimate_dev'],
    description: 'Xbox console companion and cloud gaming launcher.',
  },
  {
    name: 'Xbox Game Overlay',
    packageId: 'Microsoft.XboxGameOverlay',
    category: 'gaming',
    safeToRemove: true,
    recommendedProfiles: ['ultimate_dev'],
    description: 'Background GameDVR recording and broadcast overlay hook.',
  },
  {
    name: 'Xbox Gaming Overlay (Game Bar)',
    packageId: 'Microsoft.XboxGamingOverlay',
    category: 'gaming',
    safeToRemove: true,
    recommendedProfiles: ['ultimate_dev'],
    description: 'Win+G Game Bar UI layer causing input stutter in certain fullscreen titles.',
  },

  // OEM Telemetry Bloatware
  {
    name: 'HP Bloatware Hub (myHP)',
    packageId: 'AD2F1837.myHP',
    category: 'oem',
    safeToRemove: true,
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
    description: 'HP OEM telemetry collector, marketing feed, and diagnostics hub.',
  },
  {
    name: 'Dell SupportAssist',
    packageId: 'DellInc.DellSupportAssistforPCs',
    category: 'oem',
    safeToRemove: true,
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
    description: 'Dell automated background scan agent and telemetry reporter.',
  },
  {
    name: 'Lenovo Vantage Service',
    packageId: 'LenovoCompanyLimited.LenovoVantageService',
    category: 'oem',
    safeToRemove: true,
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
    description: 'Lenovo background hardware analytics and promotional service.',
  },
  {
    name: 'Acer Care Center',
    packageId: 'AcerIncorporated.AcerCareCenterS',
    category: 'oem',
    safeToRemove: true,
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
    description: 'Acer hardware monitoring agent with auto-update polling.',
  },
  {
    name: 'Samsung Quick Share',
    packageId: 'SAMSUNGELECTRONICSCoLtd.SamsungQuickShare',
    category: 'oem',
    safeToRemove: true,
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
    description: 'Samsung wireless sharing daemon running persistent background listeners.',
  },
];

/**
 * Windows 11 Telemetry & Privacy Registry Settings
 * Sourced from Win11Debloat/Regfiles and Sophia-Script telemetry module.
 */
export const TELEMETRY_REGISTRY_SETTINGS: TelemetrySetting[] = [
  {
    path: 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\DataCollection',
    name: 'AllowTelemetry',
    value: 0,
    description: 'Disable Windows Telemetry and Diagnostic Data collection',
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
  },
  {
    path: 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\AdvertisingInfo',
    name: 'Enabled',
    value: 0,
    description: 'Disable Advertising ID tracking for cross-app profiling',
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
  },
  {
    path: 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Privacy',
    name: 'TailoredExperiencesWithDiagnosticDataEnabled',
    value: 0,
    description: 'Disable tailored experiences with diagnostic telemetry',
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
  },
  {
    path: 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\System',
    name: 'PublishUserActivities',
    value: 0,
    description: 'Disable user activity history publishing to Microsoft Graph',
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
  },
  {
    path: 'HKCU:\\Software\\Microsoft\\Speech_OneCore\\Settings\\OnlineSpeechPrivacy',
    name: 'HasAccepted',
    value: 0,
    description: 'Disable cloud speech recognition audio sampling',
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
  },
  {
    path: 'HKCU:\\Software\\Microsoft\\Input\\TIPC',
    name: 'Enabled',
    value: 0,
    description: 'Disable typing and inking diagnostic telemetry',
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
  },
  {
    path: 'HKCU:\\Software\\Microsoft\\InputPersonalization',
    name: 'RestrictImplicitInkCollection',
    value: 1,
    description: 'Restrict implicit ink handwriting sample collection',
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
  },
  {
    path: 'HKCU:\\Software\\Microsoft\\InputPersonalization',
    name: 'RestrictImplicitTextCollection',
    value: 1,
    description: 'Restrict implicit text keystroke diagnostic collection',
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
  },
  {
    path: 'HKCU:\\Software\\Microsoft\\InputPersonalization\\TrainedDataStore',
    name: 'HarvestContacts',
    value: 0,
    description: 'Disable harvesting contacts for speech and inking dictionaries',
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
  },
  {
    path: 'HKCU:\\Software\\Microsoft\\Personalization\\Settings',
    name: 'AcceptedPrivacyPolicy',
    value: 0,
    description: 'Revoke personalization privacy consent',
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
  },
  {
    path: 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced',
    name: 'Start_TrackProgs',
    value: 0,
    description: 'Disable app launch frequency tracking in Start menu',
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
  },
  {
    path: 'HKCU:\\SOFTWARE\\Microsoft\\Siuf\\Rules',
    name: 'NumberOfSIUFInPeriod',
    value: 0,
    description: 'Set Windows Customer Feedback frequency to Never',
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
  },
  {
    path: 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Edge',
    name: 'PersonalizationReportingEnabled',
    value: 0,
    description: 'Disable Microsoft Edge browsing history and ad reporting',
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
  },
  {
    path: 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Edge',
    name: 'DiagnosticData',
    value: 0,
    description: 'Disable Microsoft Edge telemetry and crash data forwarding',
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
  },
  {
    path: 'HKCU:\\Software\\Policies\\Microsoft\\Windows\\WindowsCopilot',
    name: 'TurnOffWindowsCopilot',
    value: 1,
    description: 'Disable Windows Copilot for current user',
    recommendedProfiles: ['gaming', 'ultimate_dev'],
  },
  {
    path: 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsCopilot',
    name: 'TurnOffWindowsCopilot',
    value: 1,
    description: 'Disable Windows Copilot system-wide for all users',
    recommendedProfiles: ['gaming', 'ultimate_dev'],
  },
  {
    path: 'HKCU:\\Software\\Policies\\Microsoft\\Windows\\Explorer',
    name: 'DisableSearchBoxSuggestions',
    value: 1,
    description: 'Disable Bing search web suggestions in Start & Windows Search',
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
  },
  {
    path: 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Search',
    name: 'AllowCortana',
    value: 0,
    description: 'Disable Cortana in Windows Search',
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
  },
  {
    path: 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Search',
    name: 'CortanaConsent',
    value: 0,
    description: 'Revoke search consent for Cortana integration',
    recommendedProfiles: ['minimal', 'gaming', 'ultimate_dev'],
  },
  {
    path: 'HKCU:\\System\\GameConfigStore',
    name: 'GameDVR_Enabled',
    value: 0,
    description: 'Disable Xbox Game DVR background clip recording',
    recommendedProfiles: ['gaming'],
  },
  {
    path: 'HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\GameDVR',
    name: 'AppCaptureEnabled',
    value: 0,
    description: 'Disable background game capture polling',
    recommendedProfiles: ['gaming'],
  },
  {
    path: 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\GameDVR',
    name: 'AllowGameDVR',
    value: 0,
    description: 'Enforce Game DVR disable policy system-wide',
    recommendedProfiles: ['gaming'],
  },
];

/**
 * Service Configuration Rules
 */
export const SERVICE_CONFIGURATIONS: ServiceConfig[] = [
  {
    name: 'DiagTrack',
    displayName: 'Connected User Experiences and Telemetry',
    startupType: 'Disabled',
    description: 'Primary Windows telemetry and diagnostics collection service.',
    targetProfiles: ['minimal', 'gaming', 'ultimate_dev'],
  },
  {
    name: 'dmwappushservice',
    displayName: 'Device Management Wireless Application Protocol (WAP) Push',
    startupType: 'Disabled',
    description: 'Routes telemetry events from WAP protocol push messages.',
    targetProfiles: ['minimal', 'gaming', 'ultimate_dev'],
  },
  {
    name: 'WerSvc',
    displayName: 'Windows Error Reporting Service',
    startupType: 'Manual',
    description: 'Sends crash reports to Microsoft servers; throttled in gaming profiles.',
    targetProfiles: ['gaming', 'ultimate_dev'],
  },
  {
    name: 'SysMain',
    displayName: 'SysMain (Superfetch)',
    startupType: 'Manual',
    description: 'Maintains background caching; can cause NVMe disk latency spikes in games.',
    targetProfiles: ['gaming'],
  },
  {
    name: 'MapsBroker',
    displayName: 'Downloaded Maps Manager',
    startupType: 'Disabled',
    description: 'Background downloader for offline maps data.',
    targetProfiles: ['minimal', 'gaming', 'ultimate_dev'],
  },
  {
    name: 'RetailDemo',
    displayName: 'Retail Demo Service',
    startupType: 'Disabled',
    description: 'Demo service intended solely for store display devices.',
    targetProfiles: ['minimal', 'gaming', 'ultimate_dev'],
  },
  {
    name: 'XblAuthManager',
    displayName: 'Xbox Live Auth Manager',
    startupType: 'Manual',
    description: 'Xbox authentication daemon.',
    targetProfiles: ['ultimate_dev'],
  },
  {
    name: 'XblGameSave',
    displayName: 'Xbox Live Game Save Service',
    startupType: 'Manual',
    description: 'Syncs Xbox cloud saves.',
    targetProfiles: ['ultimate_dev'],
  },
  {
    name: 'XboxNetApiSvc',
    displayName: 'Xbox Live Networking Service',
    startupType: 'Manual',
    description: 'Xbox peer-to-peer networking client.',
    targetProfiles: ['ultimate_dev'],
  },
];

/**
 * Returns all recognized bloatware packages with metadata.
 */
export function getBloatwarePackages(): BloatPackage[] {
  return [...BLOATWARE_PACKAGES];
}

/**
 * Returns the list of standard telemetry registry keys and expected values.
 */
export function getTelemetryRegistryKeys(): {
  path: string;
  name: string;
  value: number | string;
  description: string;
}[] {
  return TELEMETRY_REGISTRY_SETTINGS.map((item) => ({
    path: item.path,
    name: item.name,
    value: item.value,
    description: item.description,
  }));
}

/**
 * Generates an end-to-end, production-ready PowerShell debloat script.
 */
export function generateDebloatScript(
  profile: DebloatProfile,
  options?: DebloatScriptOptions
): string {
  // Resolve profile defaults with optional overrides
  const removeCopilot = options?.removeCopilot ?? (profile === 'gaming' || profile === 'ultimate_dev');
  const disableTelemetry = options?.disableTelemetry ?? true;
  const optimizeGamingServices = options?.optimizeGamingServices ?? (profile === 'gaming');
  const disableBingSearch = options?.disableBingSearch ?? true;

  const targetPackages = BLOATWARE_PACKAGES.filter((pkg) =>
    pkg.recommendedProfiles.includes(profile)
  );

  const targetServices = SERVICE_CONFIGURATIONS.filter((svc) =>
    svc.targetProfiles.includes(profile)
  );

  const lines: string[] = [
    '# =============================================================================',
    `# Win11Debloat Automation Script — Profile: [${profile.toUpperCase()}]`,
    '# Reverse-engineered from Win11Debloat & Sophia-Script for Windows 11',
    '# =============================================================================',
    '',
    '# [Phase 0] Execution Policy and Error Handling',
    'Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force',
    "$ErrorActionPreference = 'SilentlyContinue'",
    '',
    'function Set-ToolForgeRegKey {',
    '    param (',
    '        [string]$Path,',
    '        [string]$Name,',
    '        [object]$Value,',
    '        [string]$Type = "DWord"',
    '    )',
    '    if (!(Test-Path $Path)) {',
    '        New-Item -Path $Path -Force -ErrorAction SilentlyContinue | Out-Null',
    '    }',
    '    Set-ItemProperty -Path $Path -Name $Name -Value $Value -Type $Type -Force -ErrorAction SilentlyContinue | Out-Null',
    '}',
    '',
  ];

  // Phase 1: Telemetry & Diagnostic Data
  if (disableTelemetry) {
    lines.push(
      '# [Phase 1] Telemetry & Diagnostic Data Purge',
      'Write-Output "[Win11Debloat] Purging diagnostic telemetry and tracking keys..."'
    );
    const telemetryKeys = TELEMETRY_REGISTRY_SETTINGS.filter(
      (k) =>
        k.recommendedProfiles.includes(profile) &&
        !k.name.includes('Copilot') &&
        !k.name.includes('Search') &&
        !k.name.includes('Cortana') &&
        !k.path.includes('GameDVR') &&
        !k.path.includes('GameConfigStore') &&
        !k.path.includes('WindowsCopilot')
    );
    for (const key of telemetryKeys) {
      lines.push(
        `Set-ToolForgeRegKey -Path "${key.path}" -Name "${key.name}" -Value ${key.value} -Type "DWord"`
      );
    }
    lines.push(
      'Get-ScheduledTask -TaskPath "\\Microsoft\\Windows\\Customer Experience Improvement Program\\" -ErrorAction SilentlyContinue | Disable-ScheduledTask -ErrorAction SilentlyContinue | Out-Null',
      'Get-ScheduledTask -TaskPath "\\Microsoft\\Windows\\Application Experience\\" -ErrorAction SilentlyContinue | Disable-ScheduledTask -ErrorAction SilentlyContinue | Out-Null',
      ''
    );
  }

  // Phase 2: Bing & Cortana Search Integration
  if (disableBingSearch) {
    lines.push(
      '# [Phase 2] Bing Web Search & Cortana In Search Suppression',
      'Write-Output "[Win11Debloat] Disabling Bing search box suggestions and Cortana..."',
      'Set-ToolForgeRegKey -Path "HKCU:\\Software\\Policies\\Microsoft\\Windows\\Explorer" -Name "DisableSearchBoxSuggestions" -Value 1 -Type "DWord"',
      'Set-ToolForgeRegKey -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Search" -Name "AllowCortana" -Value 0 -Type "DWord"',
      'Set-ToolForgeRegKey -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Search" -Name "CortanaConsent" -Value 0 -Type "DWord"',
      'Set-ToolForgeRegKey -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Search" -Name "BingSearchEnabled" -Value 0 -Type "DWord"',
      ''
    );
  }

  // Phase 3: Copilot & AI Features
  if (removeCopilot) {
    lines.push(
      '# [Phase 3] Copilot & Background AI Suppression',
      'Write-Output "[Win11Debloat] Suppressing Windows Copilot buttons and cloud analysis..."',
      'Set-ToolForgeRegKey -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" -Name "ShowCopilotButton" -Value 0 -Type "DWord"',
      'Set-ToolForgeRegKey -Path "HKCU:\\Software\\Policies\\Microsoft\\Windows\\WindowsCopilot" -Name "TurnOffWindowsCopilot" -Value 1 -Type "DWord"',
      'Set-ToolForgeRegKey -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsCopilot" -Name "TurnOffWindowsCopilot" -Value 1 -Type "DWord"',
      'Set-ToolForgeRegKey -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsAI" -Name "DisableAIDataAnalysis" -Value 1 -Type "DWord"',
      ''
    );
  }

  // Phase 4: Gaming & Low-Latency Optimization
  if (optimizeGamingServices) {
    lines.push(
      '# [Phase 4] Low-Latency Gaming & GameDVR Tuning',
      'Write-Output "[Win11Debloat] Disabling GameDVR screen recorder and tuning responsiveness..."',
      'Set-ToolForgeRegKey -Path "HKCU:\\System\\GameConfigStore" -Name "GameDVR_Enabled" -Value 0 -Type "DWord"',
      'Set-ToolForgeRegKey -Path "HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\GameDVR" -Name "AppCaptureEnabled" -Value 0 -Type "DWord"',
      'Set-ToolForgeRegKey -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\GameDVR" -Name "AllowGameDVR" -Value 0 -Type "DWord"',
      'Set-ToolForgeRegKey -Path "HKCU:\\SOFTWARE\\Microsoft\\GameBar" -Name "UseNexusForGameBarEnabled" -Value 0 -Type "DWord"',
      'Set-ToolForgeRegKey -Path "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile" -Name "NetworkThrottlingIndex" -Value 4294967295 -Type "DWord"',
      'Set-ToolForgeRegKey -Path "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile" -Name "SystemResponsiveness" -Value 0 -Type "DWord"',
      ''
    );
  }

  // Phase 5: Service Tuning
  if (targetServices.length > 0) {
    lines.push(
      '# [Phase 5] Service Configuration',
      'Write-Output "[Win11Debloat] Configuring system telemetry and background services..."'
    );
    for (const svc of targetServices) {
      lines.push(
        `if (Get-Service -Name "${svc.name}" -ErrorAction SilentlyContinue) {`,
        `    Stop-Service -Name "${svc.name}" -Force -ErrorAction SilentlyContinue`,
        `    Set-Service -Name "${svc.name}" -StartupType ${svc.startupType} -ErrorAction SilentlyContinue`,
        `}`
      );
    }
    lines.push('');
  }

  // Phase 6: AppX Bloatware Package Removal
  if (targetPackages.length > 0) {
    lines.push(
      '# [Phase 6] AppX Bloatware Removal',
      'Write-Output "[Win11Debloat] Removing provisioned and installed bloatware packages..."',
      '$bloatPackages = @('
    );
    for (const pkg of targetPackages) {
      lines.push(`    "${pkg.packageId}",`);
    }
    lines.push(
      ')',
      'foreach ($pkg in $bloatPackages) {',
      '    Get-AppxPackage -AllUsers -Name "*$pkg*" -ErrorAction SilentlyContinue | Remove-AppxPackage -AllUsers -ErrorAction SilentlyContinue',
      '    Get-AppxProvisionedPackage -Online -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName -like "*$pkg*" } | Remove-AppxProvisionedPackage -Online -ErrorAction SilentlyContinue | Out-Null',
      '}',
      ''
    );
  }

  // Phase 7: Ultimate Dev Customizations
  if (profile === 'ultimate_dev') {
    lines.push(
      '# [Phase 7] Ultimate Developer System Tweaks',
      'Write-Output "[Win11Debloat] Enabling developer file visibility and taskbar shortcuts..."',
      'Set-ToolForgeRegKey -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" -Name "HideFileExt" -Value 0 -Type "DWord"',
      'Set-ToolForgeRegKey -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" -Name "Hidden" -Value 1 -Type "DWord"',
      'Set-ToolForgeRegKey -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\TaskbarDeveloperSettings" -Name "TaskbarEndTask" -Value 1 -Type "DWord"',
      ''
    );
  }

  lines.push(
    `Write-Output "[Win11Debloat] Applied '${profile}' debloat profile successfully."`
  );

  return lines.join('\n');
}

/**
 * Validates PowerShell script syntax, checks for balanced quotes, delimiters,
 * trailing unmatched pipes, and extracts invoked commands.
 */
export function validatePowerShellSyntax(script: string): PowerShellSyntaxResult {
  if (!script || !script.trim()) {
    return { valid: false, lineCount: 0, commands: [] };
  }

  const lines = script.split(/\r?\n/);
  const lineCount = lines.length;
  const stack: { char: string; line: number }[] = [];
  const commandsSet = new Set<string>();

  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inBlockComment = false;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    let inLineComment = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = i + 1 < line.length ? line[i + 1] : '';

      if (inBlockComment) {
        if (char === '#' && nextChar === '>') {
          inBlockComment = false;
          i++;
        }
        continue;
      }

      if (inLineComment) {
        continue;
      }

      if (inSingleQuote) {
        if (char === "'") {
          if (nextChar === "'") {
            i++; // skip escaped single quote ''
          } else {
            inSingleQuote = false;
          }
        }
        continue;
      }

      if (inDoubleQuote) {
        if (char === '`' && (nextChar === '"' || nextChar === '`')) {
          i++; // skip escaped quote `" or backtick ``
        } else if (char === '"') {
          if (nextChar === '"') {
            i++; // skip escaped quote ""
          } else {
            inDoubleQuote = false;
          }
        }
        continue;
      }

      // Check comments
      if (char === '<' && nextChar === '#') {
        inBlockComment = true;
        i++;
        continue;
      }

      if (char === '#') {
        inLineComment = true;
        continue;
      }

      if (char === "'") {
        inSingleQuote = true;
        continue;
      }

      if (char === '"') {
        inDoubleQuote = true;
        continue;
      }

      // Delimiter tracking
      if (char === '(' || char === '{' || char === '[') {
        stack.push({ char, line: lineIdx + 1 });
      } else if (char === ')' || char === '}' || char === ']') {
        const matching = char === ')' ? '(' : char === '}' ? '{' : '[';
        if (stack.length === 0 || stack[stack.length - 1].char !== matching) {
          return { valid: false, lineCount, commands: [] };
        }
        stack.pop();
      }
    }
  }

  // Unclosed quotes or unclosed blocks
  if (inSingleQuote || inDoubleQuote || inBlockComment || stack.length > 0) {
    return { valid: false, lineCount, commands: [] };
  }

  // Check for trailing dangling pipe
  const cleanedCodeLines = lines
    .map((l) => l.replace(/#.*$/, '').trim())
    .filter((l) => l.length > 0);
  if (cleanedCodeLines.length > 0) {
    const lastLine = cleanedCodeLines[cleanedCodeLines.length - 1];
    if (lastLine.endsWith('|')) {
      return { valid: false, lineCount, commands: [] };
    }
  }

  // Extract invoked cmdlets and executables
  const commandRegex = /\b([A-Z][a-zA-Z0-9]*-([A-Z][a-zA-Z0-9]*)|powercfg|schtasks|reg)\b/gi;
  let match: RegExpExecArray | null;
  while ((match = commandRegex.exec(script)) !== null) {
    commandsSet.add(match[1]);
  }

  const commands = Array.from(commandsSet).sort();
  return { valid: true, lineCount, commands };
}
