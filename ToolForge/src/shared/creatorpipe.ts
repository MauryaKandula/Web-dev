/**
 * CreatorPipe Shared Engine
 * Technical content assistant for student creators & dev educators (@rin.exe.codes / InsideMayu style).
 * Generates 3-zone high-retention video scripts (Hook, Mechanism, Payoff),
 * screen capture asset plans, karaoke word-level timing, and YouTube/Instagram publishing bundles.
 */

export interface ScriptBeat {
  id: string;
  timestamp: string;
  speechText: string;
  visualCue: string;
  codeOrCommandSnippet?: string;
  onScreenText?: string;
  sfxCue?: string;
}

export interface ThreeZoneScript {
  id: string;
  title: string;
  topic: string;
  targetDurationSeconds: number;
  hook: {
    durationSec: number;
    visualHook: string;
    speechHook: string;
    bannerHeadline: string;
  };
  mechanismBeats: ScriptBeat[];
  payoff: {
    durationSec: number;
    keyTakeaway: string;
    ctaSpeech: string;
    githubOrToolLink: string;
  };
  tags: string[];
  thumbnailBrief: {
    titleA: string;
    titleB: string;
    neonPillBadge: string;
    backgroundStyle: string;
    avatarExpression: 'shock' | 'think' | 'excited' | 'laser_eyes';
  };
  status: 'draft' | 'scripted' | 'recorded' | 'ready_to_publish';
}

export interface KaraokeWordChunk {
  word: string;
  startMs: number;
  endMs: number;
  isKeyTerm: boolean;
}

/**
 * Generate word-level timing for high-retention 60fps vertical short captions
 */
export function generateKaraokeTimings(text: string, startOffsetMs: number = 0, wordsPerMinute: number = 165): KaraokeWordChunk[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const msPerWord = Math.round((60 * 1000) / wordsPerMinute);
  const technicalKeywords = new Set([
    'ram', 'cpu', 'memory', 'cache', 'kernel', 'api', 'docker', 'database', 'linux',
    'python', 'react', 'git', 'sql', 'dsa', 'btree', 'concurrency', 'bufferbloat',
    'p/invoke', 'windows', 'latency', 'token', 'hmac', 'sha256', 'tcp', 'udp'
  ]);

  let currentMs = startOffsetMs;
  return words.map((rawWord) => {
    const clean = rawWord.toLowerCase().replace(/[^a-z0-9#+]/g, '');
    const isKeyTerm = technicalKeywords.has(clean);
    const duration = isKeyTerm ? Math.round(msPerWord * 1.2) : msPerWord;
    const chunk: KaraokeWordChunk = {
      word: rawWord,
      startMs: currentMs,
      endMs: currentMs + duration,
      isKeyTerm
    };
    currentMs += duration + 20; // 20ms pause between tokens
    return chunk;
  });
}

/**
 * Convert script beats into standard SubRip (.srt) subtitle format
 */
export function formatSRT(script: ThreeZoneScript): string {
  const allLines: { startSec: number; endSec: number; text: string }[] = [];

  // Hook
  allLines.push({
    startSec: 0,
    endSec: script.hook.durationSec,
    text: script.hook.speechHook
  });

  // Mechanism beats
  let currentSec = script.hook.durationSec;
  for (const beat of script.mechanismBeats) {
    const beatDuration = Math.max(3, Math.round(beat.speechText.split(/\s+/).length / 2.8));
    allLines.push({
      startSec: currentSec,
      endSec: currentSec + beatDuration,
      text: beat.speechText
    });
    currentSec += beatDuration;
  }

  // Payoff
  allLines.push({
    startSec: currentSec,
    endSec: currentSec + script.payoff.durationSec,
    text: `${script.payoff.keyTakeaway} ${script.payoff.ctaSpeech}`
  });

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds - Math.floor(seconds)) * 1000);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  };

  return allLines
    .map((item, index) => {
      return `${index + 1}\r\n${formatTime(item.startSec)} --> ${formatTime(item.endSec)}\r\n${item.text}\r\n`;
    })
    .join('\r\n');
}

/**
 * Generate full markdown production brief for creator filming session
 */
export function exportProductionBriefMarkdown(script: ThreeZoneScript): string {
  return `# CreatorPipe Production Brief: ${script.title}
**Topic:** ${script.topic} | **Target Duration:** ${script.targetDurationSeconds}s | **Status:** ${script.status.toUpperCase()}

---

## ⚡ ZONE 1: THE 3-SECOND HOOK (0 - ${script.hook.durationSec}s)
- **Visual Staging:** ${script.hook.visualHook}
- **On-Screen Headline:** "${script.hook.bannerHeadline}"
- **Spoken Audio:** "${script.hook.speechHook}"

---

## 🔬 ZONE 2: THE TECHNICAL MECHANISM (${script.hook.durationSec}s - ${script.targetDurationSeconds - script.payoff.durationSec}s)
${script.mechanismBeats
  .map(
    (b, idx) => `### Beat ${idx + 1} [${b.timestamp}]
- **Visual Cue:** ${b.visualCue}
- **Voiceover:** "${b.speechText}"
${b.codeOrCommandSnippet ? `\`\`\`bash\n${b.codeOrCommandSnippet}\n\`\`\`` : ''}
${b.onScreenText ? `- **Screen Text:** \`${b.onScreenText}\`` : ''}
${b.sfxCue ? `- **Sound FX:** *${b.sfxCue}*` : ''}
`
  )
  .join('\n')}

---

## 🎯 ZONE 3: THE PAYOFF & REPO CTA (${script.targetDurationSeconds - script.payoff.durationSec}s - ${script.targetDurationSeconds}s)
- **Technical Takeaway:** ${script.payoff.keyTakeaway}
- **Call To Action:** "${script.payoff.ctaSpeech}"
- **Resource / GitHub Link:** ${script.payoff.githubOrToolLink}

---

## 🎨 THUMBNAIL & VIRAL ASSET BRIEF
- **Option A Title:** ${script.thumbnailBrief.titleA}
- **Option B Title:** ${script.thumbnailBrief.titleB}
- **Neon Pill Badge:** \`${script.thumbnailBrief.neonPillBadge}\`
- **Visual Style:** ${script.thumbnailBrief.backgroundStyle}
- **Avatar Pose:** ${script.thumbnailBrief.avatarExpression.toUpperCase()}
- **Tags:** ${script.tags.join(', ')}
`;
}

/**
 * High-performing CSE concept presets
 */
export const cseScriptPresets: ThreeZoneScript[] = [
  {
    id: 'script_ram_trimmer',
    title: 'Why Windows Freezes Even With 16GB RAM',
    topic: 'Windows Memory Architecture & EmptyWorkingSet API',
    targetDurationSeconds: 58,
    hook: {
      durationSec: 4,
      visualHook: 'Close-up of Windows Task Manager with 94% Memory red bar while only VS Code is open.',
      speechHook: 'Your Windows laptop is not slow because of Chrome. It is slow because of modified page lists.',
      bannerHeadline: '94% RAM USED WITH ZERO APPS OPEN?'
    },
    mechanismBeats: [
      {
        id: 'beat_1',
        timestamp: '0:04 - 0:18',
        speechText: 'When apps run, Windows allocates working sets. When you close them, their pages linger in the Standby list instead of returning to free memory.',
        visualCue: 'Animation of RAM divided into Active, Standby, and Free blocks.',
        onScreenText: 'Active vs Standby vs Free Memory',
        sfxCue: 'Data glitch sound'
      },
      {
        id: 'beat_2',
        timestamp: '0:18 - 0:34',
        speechText: 'Instead of downloading sketchy cleaners with malware, you can call the documented Win32 EmptyWorkingSet API in one line of PowerShell.',
        visualCue: 'Terminal opening with native C# P/Invoke script.',
        codeOrCommandSnippet: '[SetProcessWorkingSetSize]([IntPtr]-1, -1, -1)',
        onScreenText: 'Native Win32 Memory Flush'
      },
      {
        id: 'beat_3',
        timestamp: '0:34 - 0:48',
        speechText: 'Watch: running this immediately drops memory from 14.8GB down to 8.2GB without killing a single active background process.',
        visualCue: 'Split screen: executing script on left, Task Manager graph plummeting on right.',
        sfxCue: 'Woosh & impact bass'
      }
    ],
    payoff: {
      durationSec: 10,
      keyTakeaway: 'Understanding OS virtual memory beats buying extra RAM for your college laptop.',
      ctaSpeech: 'I open-sourced the complete 20-line script on ToolForge. Link in bio to grab it for free.',
      githubOrToolLink: 'https://toolforge.dev/p/winslick-ram-trimmer'
    },
    tags: ['#computerscience', '#windows11', '#developer', '#coding', '#engineering'],
    thumbnailBrief: {
      titleA: 'STOP Buying More RAM!',
      titleB: 'The 1-Line Windows Fix Nobody Tells You',
      neonPillBadge: 'P/INVOKE TRICK',
      backgroundStyle: 'Dark cyber room with holographic glowing memory bars and VS Code matrix rain.',
      avatarExpression: 'shock'
    },
    status: 'scripted'
  },
  {
    id: 'script_interview_twosum',
    title: 'How Interviewers Actually Grade Your Two Sum Solution',
    topic: 'DSA Placement Strategy & Hash Map Invariant',
    targetDurationSeconds: 52,
    hook: {
      durationSec: 3,
      visualHook: 'Whiteboard showing O(n^2) nested loops getting a red X marked across it.',
      speechHook: 'If you write nested loops for Two Sum in a technical interview, you failed in the first 90 seconds.',
      bannerHeadline: 'NESTED LOOPS = INSTANT REJECTION'
    },
    mechanismBeats: [
      {
        id: 'beat_1',
        timestamp: '0:03 - 0:18',
        speechText: 'Interviewers do not care that your solution passed. They are testing whether you understand complementary lookup invariants.',
        visualCue: 'Animated hash table visualizing current element and target minus num.',
        onScreenText: 'Complement = Target - Current',
        sfxCue: 'Chime ding'
      },
      {
        id: 'beat_2',
        timestamp: '0:18 - 0:36',
        speechText: 'By maintaining an in-flight seen map, you achieve O(N) time and O(N) auxiliary space in a single pass before the interviewer even finishes writing test cases.',
        visualCue: 'Clean TypeScript code highlighting map.has(complement).',
        codeOrCommandSnippet: 'if (seen.has(complement)) return [seen.get(complement)!, i];',
        onScreenText: 'O(N) Single-Pass Hash Map'
      }
    ],
    payoff: {
      durationSec: 16,
      keyTakeaway: 'Always state time and space complexity before typing the first line of code.',
      ctaSpeech: 'Practice all 8 high-frequency placement questions on InterviewLab with real in-browser execution.',
      githubOrToolLink: 'https://toolforge.dev/p/interviewlab-placement-dsa'
    },
    tags: ['#dsa', '#leetcode', '#campusplacements', '#codinginterview', '#cse'],
    thumbnailBrief: {
      titleA: 'Why LeetCode Easy Fails 80% of Candidates',
      titleB: 'Pass Coding Interviews In 1 Pass',
      neonPillBadge: 'O(N) vs O(N²)',
      backgroundStyle: 'Split screen: Red X on nested loop vs Green neon checkmark on hash map.',
      avatarExpression: 'think'
    },
    status: 'draft'
  }
];
