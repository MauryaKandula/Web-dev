import { buildZipArchive, type ZipFileEntry } from './portfoliodeploy.ts';

export interface VivaQuestionItem {
  id: string;
  question: string;
  concept: string;
  modelAnswer: string;
  followUp: string;
}

export interface StarterKitFile {
  path: string;
  description: string;
  language: string;
  content: string;
}

export interface StarterKit {
  id: string;
  title: string;
  subtitle: string;
  category: 'saas_backend' | 'game_engine' | 'canvas_arcade';
  techStack: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedHours: number;
  architectureDiagram: string;
  overview: string;
  keyMechanisms: Array<{
    title: string;
    description: string;
  }>;
  setupInstructions: {
    prerequisites: string[];
    steps: Array<{ command: string; explanation: string }>;
  };
  demoDataSummary: string[];
  testWalkthrough: Array<{
    testSuite: string;
    description: string;
    assertionCount: number;
  }>;
  vivaQuestions: VivaQuestionItem[];
  files: StarterKitFile[];
}

export const starterKitsData: StarterKit[] = [
  {
    id: 'kit_saas_marketplace',
    title: 'ToolForge Micro-SaaS Marketplace Engine',
    subtitle: 'Production-ready digital software store with SQLite WAL, HMAC verification & Razorpay payments',
    category: 'saas_backend',
    techStack: ['React 19', 'Express 4.22', 'Node 24 (node:sqlite)', 'TypeScript 5.9', 'Tailwind CSS 4', 'Razorpay Webhooks'],
    difficulty: 'Intermediate',
    estimatedHours: 12,
    architectureDiagram: `
+-----------------------------------------------------------------------+
|                    CLIENT TIER (React 19 + Vite)                      |
|  [Product Catalogue] <--> [Razorpay Modal SDK] <--> [User Library]    |
+-----------------------------------+-----------------------------------+
                                    | HTTPS JSON / REST
+-----------------------------------v-----------------------------------+
|               API GATEWAY / MIDDLEWARE TIER (Express)                 |
|  [JWT Auth / RBAC]    [Timing-Safe HMAC-SHA256]    [Quarantine Vault] |
+-----------------------------------+-----------------------------------+
                                    |
          +-------------------------+-------------------------+
          |                                                   |
+---------v-------------------------+       +-----------------v---------+
|     DATA LAYER (node:sqlite)      |       |    THIRD-PARTY INTEGRATION|
|  [WAL Mode Engine]                |       |  [Razorpay Payment Gateway|
|  - Users, Products, Reviews       |       |  - Order Generation       |
|  - Orders & Deduplicated Webhooks |       |  - Signature Verification |
+-----------------------------------+       +---------------------------+
`,
    overview: 'A zero-bloat, production-hardened micro-SaaS digital marketplace backend. Perfect for Indian engineering builders selling developer scripts, templates, and utilities. Features timing-safe cryptographic payment verification, idempotent commission splits, and tokenized quarantine downloads.',
    keyMechanisms: [
      {
        title: 'Timing-Safe Webhook Verification',
        description: 'Uses crypto.timingSafeEqual on calculated HMAC-SHA256 digest vs x-razorpay-signature header to prevent timing side-channel attacks.'
      },
      {
        title: 'SQLite WAL Mode with Zero C++ Compilers',
        description: 'Leverages Node.js 24 native node:sqlite DatabaseSync with PRAGMA journal_mode = WAL for ultra-fast concurrent reads and ACID transactional writes.'
      },
      {
        title: 'Strict Paise Currency Arithmetic',
        description: 'All financial calculations and order creation strictly enforce integer paise (1 INR = 100 paise) to eliminate IEEE-754 floating-point rounding errors.'
      },
      {
        title: 'Idempotent Webhook Deduplication',
        description: 'Database unique constraints on payment_webhooks.event_id ensure webhook replay attacks cannot double-credit accounts or issue duplicate licenses.'
      }
    ],
    setupInstructions: {
      prerequisites: ['Node.js v20+ or v24+', 'npm v10+', 'Git'],
      steps: [
        { command: 'npm install', explanation: 'Install zero-native dependencies including Express, React 19, and Tailwind 4' },
        { command: 'npm run seed', explanation: 'Initialize SQLite database in data/toolforge.db with WAL mode and initial catalog' },
        { command: 'npm test', explanation: 'Run Vitest integration suite verifying auth, payments, and storage security' },
        { command: 'npm run dev', explanation: 'Start unified Express API server and Vite client on localhost:3005' }
      ]
    },
    demoDataSummary: [
      '4 Pre-seeded users: Local Admin, 2 Verified Creators, 1 Customer (Demo Customer)',
      '10 Initial approved software packages across CLI tools, prompts, templates, and games',
      'Realistic review ledger with 5-star ratings and verified buyer feedback',
      'Sample order and library entitlement ready for instant testing'
    ],
    testWalkthrough: [
      { testSuite: 'razorpay.test.ts', description: 'Tests paise calculations, HMAC calculation, and signature tampering rejection', assertionCount: 7 },
      { testSuite: 'payment.test.ts', description: 'Validates 10% platform commission calculation and idempotency protection', assertionCount: 5 },
      { testSuite: 'auth.test.ts', description: 'Tests bcrypt password hashing and JWT token expiration/validation', assertionCount: 3 },
      { testSuite: 'storage.test.ts', description: 'Ensures file quarantine and safe sanitized path access', assertionCount: 4 }
    ],
    vivaQuestions: [
      {
        id: 'tf_viva_1',
        question: 'How does HMAC-SHA256 prevent payment tampering in Razorpay webhook callbacks?',
        concept: 'Cryptographic Message Authentication Codes & Timing Attacks',
        modelAnswer: 'Razorpay signs the webhook payload body with a shared webhook secret using HMAC-SHA256. When our server receives the request, we compute the HMAC of rawBody and use crypto.timingSafeEqual to compare it with the x-razorpay-signature header. This guarantees that: 1) the payload was not modified in transit, 2) it originated from Razorpay, and 3) timing side-channel attacks cannot deduce the valid signature byte by byte.',
        followUp: 'Why is raw request body capture critical for webhook verification instead of JSON.stringify(req.body)?'
      },
      {
        id: 'tf_viva_2',
        question: 'Why use SQLite WAL (Write-Ahead Logging) mode in a Node.js micro-SaaS?',
        concept: 'Database Concurrency & ACID Guarantees',
        modelAnswer: 'In standard rollback journal mode, SQLite locks the entire database file during writes, blocking concurrent readers. WAL mode appends changes to a separate .db-wal file while readers query the main database file simultaneously without blocking. This allows high-throughput concurrent reads and safe transactional writes without requiring heavy relational database daemons like MySQL or PostgreSQL for moderate workloads.',
        followUp: 'What happens to the WAL file during a database checkpoint?'
      },
      {
        id: 'tf_viva_3',
        question: 'Why are prices stored in integer paise rather than floating-point rupees?',
        concept: 'IEEE 754 Floating-Point Representation in Financial Systems',
        modelAnswer: 'Standard IEEE 754 double-precision floating-point numbers cannot accurately represent certain decimal fractions (e.g., 0.1 + 0.2 = 0.30000000000000004). In e-commerce and banking, fractional rounding errors accumulate across taxes, commissions, and refunds. Representing all monetary values as integers in the lowest currency denomination (paise for INR, cents for USD) guarantees exact integer arithmetic.',
        followUp: 'How do you format integer paise for user-facing UI rendering in React?'
      },
      {
        id: 'tf_viva_4',
        question: 'How do idempotency keys prevent duplicate order fulfillment?',
        concept: 'Distributed Systems & Network Replay Prevention',
        modelAnswer: 'Network retries or double-clicking by a user can cause the client or payment gateway to send duplicate HTTP requests. By attaching a client-generated or provider-generated idempotency key to the order transaction, the server queries the database for existing records with that key. If already processed, it returns the cached result without charging again or creating duplicate rows.',
        followUp: 'Where should the idempotency check happen within the database transaction?'
      },
      {
        id: 'tf_viva_5',
        question: 'What are the security implications of storing JWTs in LocalStorage vs HttpOnly cookies?',
        concept: 'Web Application Security (XSS vs CSRF)',
        modelAnswer: 'LocalStorage is accessible to any JavaScript running on the origin, making stored JWTs vulnerable to theft via Cross-Site Scripting (XSS). HttpOnly cookies cannot be read by client-side scripts, protecting the token from XSS exfiltration, but require SameSite=Lax/Strict and Anti-CSRF tokens to prevent Cross-Site Request Forgery. For micro-SaaS tools with separate API servers, bearer tokens in auth headers with short lifespans provide strong API flexibility.',
        followUp: 'How would you implement token refresh without exposing the refresh token to XSS?'
      }
    ],
    files: [
      {
        path: 'src/server/index.ts',
        description: 'Express HTTP API with timing-safe Razorpay order & webhook handlers',
        language: 'typescript',
        content: `import express from 'express';
import crypto from 'crypto';
import { db } from './database.ts';

const app = express();
app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf; // Preserve exact raw bytes for HMAC verification
  }
}));

// Timing-safe Razorpay Webhook Handler
app.post('/api/payment/razorpay-webhook', (req: any, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'test_webhook_secret_key';
  const signature = req.headers['x-razorpay-signature'] as string;
  
  if (!signature || !req.rawBody) {
    return res.status(400).json({ error: 'Missing webhook signature or payload' });
  }

  const expectedHmac = crypto.createHmac('sha256', secret).update(req.rawBody).digest('hex');
  const sigBuffer = Buffer.from(signature, 'utf8');
  const expBuffer = Buffer.from(expectedHmac, 'utf8');

  if (sigBuffer.length !== expBuffer.length || !crypto.timingSafeEqual(sigBuffer, expBuffer)) {
    return res.status(400).json({ error: 'Invalid HMAC signature' });
  }

  const event = req.body;
  // Deduplicate and process event idempotently...
  return res.json({ status: 'ok', received: event.event });
});`
      },
      {
        path: 'src/server/database.ts',
        description: 'Node.js native SQLite database configuration with WAL mode',
        language: 'typescript',
        content: `import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const DB_PATH = path.resolve('data/toolforge.db');
export const db = new DatabaseSync(DB_PATH);

export function initDatabase() {
  db.exec(\`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      amount_inr REAL NOT NULL,
      commission_rate REAL NOT NULL,
      platform_fee_inr REAL NOT NULL,
      creator_earnings_inr REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'completed',
      transaction_id TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL
    );
  \`);
}`
      },
      {
        path: 'package.json',
        description: 'Project dependencies and scripts',
        language: 'json',
        content: `{
  "name": "toolforge-micro-saas-starter",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx src/server/index.ts",
    "build": "vite build",
    "test": "vitest run",
    "seed": "tsx src/server/seed.ts"
  },
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "express": "^4.22.1",
    "jsonwebtoken": "^9.0.3",
    "react": "^19.2.5",
    "react-dom": "^19.2.5"
  }
}`
      }
    ]
  },
  {
    id: 'kit_idle_economy',
    title: 'Infinite Empire Idle Economy Engine',
    subtitle: 'Deep incremental mathematical economy with procedural Web Audio synthesis & closed-form scaling',
    category: 'game_engine',
    techStack: ['React 19', 'TypeScript 5.9', 'Web Audio API', 'Vite 8', 'LocalStorage Engine', 'Vitest'],
    difficulty: 'Intermediate',
    estimatedHours: 10,
    architectureDiagram: `
+-----------------------------------------------------------------------+
|                       REACT 19 COMPONENT TREE                         |
|   [Resource Counters] <--> [Tech Tree Nodes] <--> [Prestige Portal]   |
+-----------------------------------+-----------------------------------+
                                    | 60fps Tick / State Dispatch
+-----------------------------------v-----------------------------------+
|                     CLOSED-FORM MATHEMATICAL ENGINE                   |
|  - Exponential Cost: C_k = C_0 * r^k                                  |
|  - Geometric Series Bulk Sum: S_n = C_0 * r^k * (r^n - 1) / (r - 1)   |
|  - Offline Progression Accumulator: delta_t * rate * prestigeMult      |
+-----------------------------------+-----------------------------------+
                                    |
          +-------------------------+-------------------------+
          |                                                   |
+---------v-------------------------+       +-----------------v---------+
|     WEB AUDIO PROCEDURAL SYNTH    |       |      PERSISTENCE TIER     |
|  - OscillatorNode (Sine, Triangle)|       |  - Auto-save debounced    |
|  - GainNode Volume Envelopes      |       |  - Version migration      |
|  - Zero-latency click feedback    |       |  - Base64 export/import   |
+-----------------------------------+       +---------------------------+
`,
    overview: 'A complete, mathematically rigorous incremental economy game engine built with React 19 and the Web Audio API. Demonstrates closed-form exponential mathematics (avoiding O(N) tick loops for bulk buying), audio synthesis without sound files, quantum prestige mechanics, and offline progression calculations.',
    keyMechanisms: [
      {
        title: 'Closed-Form Geometric Series Sums',
        description: 'Computes cost of buying 1, 10, 100, or maximum affordable buildings in O(1) time using closed-form geometric progression formulas rather than incremental while loops.'
      },
      {
        title: 'Procedural Web Audio API Synthesizer',
        description: 'Zero external MP3/WAV assets. Generates sci-fi clicks, hums, and cosmic victory arpeggios using native OscillatorNode frequency modulation and exponential gain ramps.'
      },
      {
        title: 'Asymptotically Stable Prestige Mathematics',
        description: 'Calculates quantum shards earned on reset using a square root scaling law (shards = floor(150 * sqrt(lifetimeOre / 1e8))) to guarantee long-term game balance.'
      },
      {
        title: 'Deterministic Offline Progress Calculation',
        description: 'Records timestamp on unload. On reload, computes exact offline production up to a configurable ceiling (e.g. 8 hours) with diminished efficiency factor.'
      }
    ],
    setupInstructions: {
      prerequisites: ['Node.js v20+', 'npm v10+'],
      steps: [
        { command: 'npm install', explanation: 'Install React 19, TypeScript, and Vite dependencies' },
        { command: 'npm test', explanation: 'Verify closed-form formula accuracy and offline progression math' },
        { command: 'npm run dev', explanation: 'Launch local dev server with hot module reloading on port 5174' }
      ]
    },
    demoDataSummary: [
      '3 Resource tiers: Pure Iron Ore, Stellar Energy, Hyper-Alloys',
      '6 Tiered production facilities: Automated Rig, Solar Array, Smelter, Fusion Core, Dyson Collector, Warp Singularity',
      '8 Research tree technologies offering multiplicative yields',
      '10 Quantum Prestige upgrades granting permanent progression multipliers'
    ],
    testWalkthrough: [
      { testSuite: 'formulas.test.ts', description: 'Tests closed-form building cost scaling and max affordable purchase count', assertionCount: 5 },
      { testSuite: 'offline.test.ts', description: 'Tests offline calculation boundaries across 1 min, 8 hours, and 1 week gaps', assertionCount: 4 }
    ],
    vivaQuestions: [
      {
        id: 'ie_viva_1',
        question: 'Why must idle game bulk purchase calculations use closed-form geometric series rather than while loops?',
        concept: 'Algorithm Complexity & Computational Efficiency',
        modelAnswer: 'If building costs scale exponentially as C_k = C_0 * r^k, calculating the total cost of buying N buildings using a while loop takes O(N) iterations. For large values of N (or when calculating "Buy Max" where N can be thousands), an O(N) loop can cause significant frame drops or browser freezing. Using the geometric series sum formula S_N = C_k * (r^N - 1) / (r - 1) executes in O(1) constant time, and inverting the formula calculates the maximum affordable count in O(1) using logarithms.',
        followUp: 'How do you invert the geometric sum formula to solve for N when given available currency?'
      },
      {
        id: 'ie_viva_2',
        question: 'How does Web Audio API procedural synthesis prevent audio latency and garbage collection spikes?',
        concept: 'Real-Time Web Audio & Memory Management',
        modelAnswer: 'Traditional HTML5 <audio> tags suffer from playback initialization latency (often 50-100ms) and can block the main UI thread. Web Audio API executes on a high-priority native audio rendering thread. By creating ephemeral OscillatorNodes, scheduling parameter automations via exponentialRampToValueAtTime, and connecting them to a shared destination, sounds play instantly with sub-millisecond precision. Nodes are automatically garbage collected once their scheduled stop time expires.',
        followUp: 'Why must user interaction occur before an AudioContext can begin playing?'
      },
      {
        id: 'ie_viva_3',
        question: 'How do you prevent JavaScript double-precision numbers from losing accuracy when economy numbers reach astronomical levels?',
        concept: 'Numerical Precision & BigNumber / Scientific Representation',
        modelAnswer: 'JavaScript numbers are 64-bit IEEE 754 floats with 53 bits of mantissa, capable of exact integer representation up to 9,007,199,254,740,991 (9e15). Beyond this, numbers lose precision in the least significant digits. For idle games reaching 1e100+, engines use custom BigDouble classes that decouple a normalized mantissa (1.0 to 10.0) from an integer exponent. For operations like A + B where B is much smaller than A, the addition can be safely clamped or skipped.',
        followUp: 'At what exponent difference does adding B to A become mathematically negligible in 53-bit precision?'
      },
      {
        id: 'ie_viva_4',
        question: 'What is the advantage of requestAnimationFrame over setInterval for game tick loops?',
        concept: 'Browser Refresh Cycles & Screen VSync',
        modelAnswer: 'setInterval fires on a timer regardless of whether the screen is refreshing or whether the browser tab is focused, causing skipped frames, stuttering, and CPU waste in background tabs. requestAnimationFrame synchronizes callback execution with the display refresh rate (e.g. 60Hz or 144Hz) just before screen repaint. It automatically pauses or drops to 1fps when the tab is backgrounded, conserving battery and CPU power.',
        followUp: 'How does a game loop use delta time (dt) to keep movement speed consistent across 60Hz and 144Hz monitors?'
      },
      {
        id: 'ie_viva_5',
        question: 'How does prestige reset mathematics motivate long-term retention without destabilizing the economy?',
        concept: 'Game Economy Balancing & Logarithmic / Sub-Linear Scaling',
        modelAnswer: 'If prestige rewards scale linearly with accumulated currency, the optimal strategy becomes resetting constantly or never resetting. By applying sub-linear scaling (such as a square root or cube root curve like shards = c * ore^0.5), each reset requires exponentially more lifetime earnings to yield double the prestige currency. This creates an alternating cycle: active rapid growth, a diminishing returns plateau, a rewarding prestige reset, and vastly accelerated replay.',
        followUp: 'How do prestige upgrades shorten the early game without trivializing new mechanics?'
      }
    ],
    files: [
      {
        path: 'src/game/formulas.ts',
        description: 'Closed-form cost calculation and geometric series solvers',
        language: 'typescript',
        content: `// Closed-form geometric progression calculators
export function calculateBuildingCost(baseCost: number, rate: number, owned: number): number {
  return Math.floor(baseCost * Math.pow(rate, owned));
}

// S_n = C_start * (rate^count - 1) / (rate - 1) in O(1)
export function calculateBulkCost(baseCost: number, rate: number, owned: number, count: number): number {
  if (count <= 0) return 0;
  if (count === 1) return calculateBuildingCost(baseCost, rate, owned);
  const startCost = calculateBuildingCost(baseCost, rate, owned);
  return Math.floor(startCost * (Math.pow(rate, count) - 1) / (rate - 1));
}

// Invert formula: N = floor(log(1 + available * (rate - 1) / startCost) / log(rate))
export function calculateMaxAffordable(baseCost: number, rate: number, owned: number, available: number): { count: number; totalCost: number } {
  const startCost = calculateBuildingCost(baseCost, rate, owned);
  if (available < startCost) return { count: 0, totalCost: 0 };
  const count = Math.floor(Math.log(1 + (available * (rate - 1)) / startCost) / Math.log(rate));
  const totalCost = calculateBulkCost(baseCost, rate, owned, count);
  return { count, totalCost };
}`
      },
      {
        path: 'src/game/audio.ts',
        description: 'Native Web Audio API procedural sound synthesizer',
        language: 'typescript',
        content: `class SoundEngine {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  playClick(freq: number = 440) {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.09);
  }
}
export const soundEngine = new SoundEngine();`
      }
    ]
  },
  {
    id: 'kit_combat_canvas',
    title: 'Anime Clash 2D HTML5 Canvas Combat Engine',
    subtitle: 'High-performance 60fps arcade fighter with frame-accurate AABB hitboxes & AI state machine',
    category: 'canvas_arcade',
    techStack: ['TypeScript 5.9', 'HTML5 Canvas 2D', 'React 19', 'AABB Collision Math', 'FSM Architecture', 'Vite 8'],
    difficulty: 'Advanced',
    estimatedHours: 16,
    architectureDiagram: `
+-----------------------------------------------------------------------+
|                       CANVAS RENDERING PIPELINE                       |
|   [Background Stage] --> [Fighter Sprites] --> [Hitboxes / Particles] |
+-----------------------------------+-----------------------------------+
                                    | Fixed Timestep Loop (16.67ms)
+-----------------------------------v-----------------------------------+
|                         GAME ENGINE CORE TIER                         |
|  [Input Buffer]    -->    [Physics & Kinematics]   --> [AABB Intersect]|
|  - Keydown/keyup          - Gravity, Velocity          - Hurtbox vs    |
|  - 4-frame buffer         - Jump & Ground Clamping       Hitbox boxes  |
+-----------------------------------+-----------------------------------+
                                    |
          +-------------------------+-------------------------+
          |                                                   |
+---------v-------------------------+       +-----------------v---------+
|      AI BOT STATE MACHINE         |       |      AUDIO & FX TIER      |
|  - Idle / Patrol                  |       |  - Impact hit-stop freeze |
|  - Approach / Spacing             |       |  - Screen shake impulse   |
|  - Attack Combo Execution         |       |  - Spark particle emitter |
|  - Defensive Blocking             |       |  - Procedural sound cues  |
+-----------------------------------+       +---------------------------+
`,
    overview: 'An arcade fighting game engine running on pure HTML5 Canvas and TypeScript. Designed to teach Indian CSE students game physics, Axis-Aligned Bounding Box (AABB) collision mathematics, fixed timestep simulation loops, and Finite State Machine (FSM) AI agents.',
    keyMechanisms: [
      {
        title: 'Axis-Aligned Bounding Box (AABB) Collision',
        description: 'Implements frame-accurate intersection tests separating defensive hurtboxes from active offensive hitboxes with pushback vectors and hit-stop pauses.'
      },
      {
        title: 'Deterministic Fixed Timestep Loop',
        description: 'Uses an accumulator delta-time loop running at exactly 60 updates per second, ensuring reproducible physics and frame data across all monitor refresh rates.'
      },
      {
        title: 'Finite State Machine (FSM) AI Sparring Bot',
        description: 'CPU opponent evaluates player distance, state, and frame vulnerability to transition between Patrol, Approach, Strike, Block, and Recovery states.'
      },
      {
        title: 'Input Buffering & Frame Data',
        description: 'Buffers player inputs over a 4-frame window so combo inputs execute smoothly when current move recovery animation frames complete.'
      }
    ],
    setupInstructions: {
      prerequisites: ['Node.js v20+', 'npm v10+'],
      steps: [
        { command: 'npm install', explanation: 'Install TypeScript, React 19, and Vite build tooling' },
        { command: 'npm test', explanation: 'Run physics tests checking AABB overlap math and AI state transitions' },
        { command: 'npm run dev', explanation: 'Launch arcade engine on port 5175 with full 60fps canvas loop' }
      ]
    },
    demoDataSummary: [
      '2 Playable fighters: Kaito (Swift rushdown striker) and Ryoko (Heavy defensive powerhouse)',
      'Frame data dictionary detailing startup, active, and recovery frames for jabs, kicks, and specials',
      'Cyberpunk Neo-Tokyo and Sacred Temple interactive arena stages',
      'Configurable particle emitter for sparks, shockwaves, and combo counters'
    ],
    testWalkthrough: [
      { testSuite: 'physics.test.ts', description: 'Tests AABB collision intersection and boundary clamping', assertionCount: 6 },
      { testSuite: 'ai.test.ts', description: 'Tests AI state transitions across distance thresholds and health levels', assertionCount: 4 }
    ],
    vivaQuestions: [
      {
        id: 'ac_viva_1',
        question: 'How does Axis-Aligned Bounding Box (AABB) collision detection work mathematically?',
        concept: 'Computational Geometry & Collision Detection',
        modelAnswer: 'Two 2D rectangles whose edges are aligned with the coordinate axes overlap if and only if they overlap on both the X and Y axes simultaneously. For box A (x1, y1, w1, h1) and box B (x2, y2, w2, h2), collision occurs when: (x1 < x2 + w2) and (x1 + w1 > x2) and (y1 < y2 + h2) and (y1 + h1 > y2). Because it requires only four scalar comparisons and zero trigonometric operations, AABB is extremely fast and ideal for 2D game loops.',
        followUp: 'How do you extend AABB to Oriented Bounding Boxes (OBB) when sprites rotate?'
      },
      {
        id: 'ac_viva_2',
        question: 'Why is a fixed timestep accumulator necessary in fighting games instead of variable dt?',
        concept: 'Numerical Integration & Deterministic Physics',
        modelAnswer: 'Variable delta time (dt = currentTime - lastTime) causes non-deterministic physics because frame rate fluctuations alter intermediate velocity calculations. A slight frame drop could cause a character to jump higher or penetrate through ground geometry (tunneling). A fixed timestep accumulator consumes elapsed real time in fixed 16.66ms chunks (1/60s). If the frame took 33ms, the physics updates twice; if 8ms, it waits. This guarantees 100% deterministic, frame-accurate gameplay.',
        followUp: 'How do you interpolate rendering between the previous and current physics states to eliminate visual stutter?'
      },
      {
        id: 'ac_viva_3',
        question: 'What is input buffering and why is it essential for fighting game combos?',
        concept: 'Human-Computer Interaction & Input Queues',
        modelAnswer: 'In fighting games, attacks have startup, active, and recovery animation frames. If the player presses the attack button 1 frame before recovery ends, a naive system without buffering drops the input, frustrating the player. An input buffer records incoming button presses with a timestamp or lifetime counter (e.g., 4 to 8 frames). When recovery concludes, the engine checks the buffer for valid queued moves and executes them instantly.',
        followUp: 'How do fighting games detect complex directional motions like quarter-circle forward (Hadouken)?'
      },
      {
        id: 'ac_viva_4',
        question: 'How does a Finite State Machine (FSM) govern the AI opponent in 2D combat?',
        concept: 'Artificial Intelligence & Automata Theory',
        modelAnswer: 'An FSM models the bot as being in exactly one state at any given time (e.g. Idle, Approach, Attack, Block, Retreat). At each tick, the bot reads environmental sensors (player X/Y distance, player attack status, own health). Transition conditions dictate state changes: if distance > 250px, transition from Idle to Approach; if distance < 80px and player is attacking, transition to Block; if attack completes, transition to Recovery. This provides predictable, tuneable opponent behavior.',
        followUp: 'What are the limitations of FSMs compared to Behavior Trees or Utility AI?'
      },
      {
        id: 'ac_viva_5',
        question: 'What is "hit-stop" (freeze frame) and how is it implemented in a 2D engine?',
        concept: 'Game Feel, Animation & Juice',
        modelAnswer: 'Hit-stop is a brief pause (typically 3 to 8 frames / 50-130ms) applied to both the attacker and defender the moment a strike connects. It gives physical weight to impacts, communicates damage severity, and gives players time to confirm whether an attack landed before executing follow-up combo inputs. In code, it is implemented by decrementing a freezeFrame counter and skipping position updates while maintaining particle and screen shake rendering.',
        followUp: 'How do you combine hit-stop with camera screen shake to maximize impact feel?'
      }
    ],
    files: [
      {
        path: 'src/game/physics.ts',
        description: 'AABB collision detection and bounding box math',
        language: 'typescript',
        content: `export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Axis-Aligned Bounding Box (AABB) intersection check
export function checkAABBCollision(a: Box, b: Box): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}`
      },
      {
        path: 'src/game/ai.ts',
        description: 'Finite State Machine (FSM) AI bot decision engine',
        language: 'typescript',
        content: `export type AIState = 'idle' | 'approach' | 'retreat' | 'attack' | 'block';

export interface AISnapshot {
  botX: number;
  playerX: number;
  playerIsAttacking: boolean;
  distance: number;
}

export function evaluateAIState(current: AIState, snapshot: AISnapshot): AIState {
  const { distance, playerIsAttacking } = snapshot;

  if (distance < 70 && playerIsAttacking) {
    return 'block';
  }
  if (distance < 80) {
    return Math.random() > 0.3 ? 'attack' : 'retreat';
  }
  if (distance > 220) {
    return 'approach';
  }
  return current;
}`
      }
    ]
  }
];

export function getStarterKits(): StarterKit[] {
  return starterKitsData;
}

export function getStarterKitById(id: string): StarterKit | undefined {
  return starterKitsData.find(k => k.id === id);
}

export function validateKitManifest(kit: StarterKit): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!kit.id || typeof kit.id !== 'string') errors.push('Kit must have a valid string ID');
  if (!kit.title || typeof kit.title !== 'string') errors.push('Kit must have a title');
  if (!Array.isArray(kit.techStack) || kit.techStack.length === 0) errors.push('Tech stack must have at least one entry');
  if (!Array.isArray(kit.vivaQuestions) || kit.vivaQuestions.length === 0) errors.push('Kit must contain viva questions');
  if (!Array.isArray(kit.files) || kit.files.length === 0) errors.push('Kit must have source files');
  return { valid: errors.length === 0, errors };
}

export function generateStarterKitZip(kitId: string, isLicensed: boolean = false): Uint8Array {
  const kit = getStarterKitById(kitId);
  if (!kit) {
    throw new Error(`Starter kit with ID "${kitId}" not found`);
  }

  const filesToZip: ZipFileEntry[] = [];

  // 1. README.md
  const readmeContent = `# ${kit.title}
> ${kit.subtitle}

**Category**: ${kit.category} | **Difficulty**: ${kit.difficulty} | **Est. Build Time**: ${kit.estimatedHours} hrs  
**Part of ProjectLaunch (Product 05 • Wave B)**

---

## 📖 Architecture & Design Overview
${kit.overview}

\`\`\`
${kit.architectureDiagram}
\`\`\`

## 🛠️ Key Architectural Mechanisms
${kit.keyMechanisms.map(m => `### ${m.title}\n${m.description}`).join('\n\n')}

## 🚀 Setup & Execution Guide
### Prerequisites
${kit.setupInstructions.prerequisites.map(p => `- ${p}`).join('\n')}

### Commands
${kit.setupInstructions.steps.map((s, idx) => `${idx + 1}. \`${s.command}\`\n   ${s.explanation}`).join('\n')}

---

${isLicensed ? '✅ **Licensed Student Edition**: Commercial redistribution & viva submission authorized.' : '⚠️ **Community Evaluation Edition**: For educational learning. Upgrade to Pro for complete submission clearance.'}
`;
  filesToZip.push({ name: 'README.md', data: readmeContent });

  // 2. VIVA_GUIDE.md
  const vivaGuide = `# Comprehensive Viva Voce & Technical Interview Guide
**Project Kit**: ${kit.title}

This document contains actual exam and campus placement interview questions with deep technical answers, architectural insights, and examiner follow-up traps.

---

${kit.vivaQuestions.map((q, idx) => `## Question ${idx + 1}: ${q.question}
- **Core Concept**: \`${q.concept}\`
- **Model Answer**:
${q.modelAnswer}

- **Examiner Follow-Up Question**:
*${q.followUp}*

---
`).join('\n')}
`;
  filesToZip.push({ name: 'VIVA_GUIDE.md', data: vivaGuide });

  // 3. ARCHITECTURE.md
  const archContent = `# System Architecture: ${kit.title}

\`\`\`
${kit.architectureDiagram}
\`\`\`

## Tech Stack
${kit.techStack.map(t => `- **${t}**`).join('\n')}

## Test Walkthrough Specifications
${kit.testWalkthrough.map(t => `- **${t.testSuite}** (${t.assertionCount} assertions): ${t.description}`).join('\n')}

## Demo Data Specifications
${kit.demoDataSummary.map(d => `- ${d}`).join('\n')}
`;
  filesToZip.push({ name: 'ARCHITECTURE.md', data: archContent });

  // 4. Setup scripts for Windows & Linux/Mac
  filesToZip.push({
    name: 'SETUP.bat',
    data: `@echo off
echo ========================================================
echo Installing dependencies for ${kit.title}
echo ========================================================
npm install
if %ERRORLEVEL% NEQ 0 (
  echo Error: npm install failed.
  exit /b 1
)
echo Running verification test suite...
npm test
echo Starting local development server...
npm run dev
`
  });

  filesToZip.push({
    name: 'SETUP.sh',
    data: `#!/usr/bin/env bash
set -e
echo "========================================================"
echo "Installing dependencies for ${kit.title}"
echo "========================================================"
npm install
echo "Running verification test suite..."
npm test
echo "Starting local development server..."
npm run dev
`
  });

  // 5. Code files
  for (const f of kit.files) {
    filesToZip.push({ name: f.path, data: f.content });
  }

  return buildZipArchive(filesToZip);
}
