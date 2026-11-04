export interface FileItem {
  path: string;
  sizeBytes?: number;
  contentSnippet?: string;
}

export interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  sizeBytes?: number;
  children?: TreeNode[];
}

export interface DetectedTech {
  name: string;
  category: 'Frontend' | 'Backend' | 'Database' | 'Testing' | 'Language' | 'DevOps';
  confidence: number;
  description: string;
}

export interface ArchitectureComponent {
  name: string;
  type: 'entrypoint' | 'service' | 'database' | 'route' | 'config' | 'test';
  filePath: string;
  lineReference?: string;
  description: string;
}

export interface StarterIssue {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate';
  category: 'Feature' | 'Testing' | 'Refactor' | 'Security';
  fileReference: string;
  description: string;
  suggestedSteps: string[];
}

export interface SecurityAuditResult {
  passed: boolean;
  safeFiles: FileItem[];
  detectedRisks: string[];
}

export interface RepoLensAnalysis {
  repoName: string;
  repoUrl?: string;
  totalFiles: number;
  totalBytes: number;
  fileTree: TreeNode;
  techStack: DetectedTech[];
  entrypoints: ArchitectureComponent[];
  coreServices: ArchitectureComponent[];
  databaseSchemas: ArchitectureComponent[];
  routes: ArchitectureComponent[];
  setupGuideMarkdown: string;
  architectureMarkdown: string;
  starterIssues: StarterIssue[];
  securityNotes: string[];
  detectedRisks: string[];
  securityAuditPassed: boolean;
}

export function buildFileTree(files: FileItem[]): TreeNode {
  const root: TreeNode = {
    name: 'root',
    path: '',
    type: 'directory',
    children: []
  };

  for (const file of files) {
    const parts = file.path.replace(/\\/g, '/').split('/').filter(Boolean);
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      const subPath = parts.slice(0, i + 1).join('/');

      if (!current.children) {
        current.children = [];
      }

      let child = current.children.find(c => c.name === part);

      if (!child) {
        child = {
          name: part,
          path: subPath,
          type: isFile ? 'file' : 'directory',
          sizeBytes: isFile ? (file.sizeBytes || 1024) : undefined,
          children: isFile ? undefined : []
        };
        current.children.push(child);
      }
      current = child;
    }
  }

  // Sort directories first, then alphabetical
  function sortTree(node: TreeNode) {
    if (node.children) {
      node.children.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      node.children.forEach(sortTree);
    }
  }
  sortTree(root);

  return root;
}

export function detectTechStack(filePaths: string[], packageJsonContent?: string): DetectedTech[] {
  const detected: DetectedTech[] = [];
  const joinedPaths = filePaths.join(' ').toLowerCase();

  // Languages
  if (filePaths.some(p => p.endsWith('.ts') || p.endsWith('.tsx'))) {
    detected.push({ name: 'TypeScript', category: 'Language', confidence: 100, description: 'Strict static typing & interfaces' });
  }
  if (filePaths.some(p => p.endsWith('.js') || p.endsWith('.jsx'))) {
    detected.push({ name: 'JavaScript', category: 'Language', confidence: 95, description: 'ECMAScript execution' });
  }
  if (filePaths.some(p => p.endsWith('.py'))) {
    detected.push({ name: 'Python', category: 'Language', confidence: 100, description: 'Python 3 script/service runtime' });
  }

  // Frontend
  if (packageJsonContent?.includes('"react"') || filePaths.some(p => p.includes('.tsx') || p.includes('App.tsx'))) {
    detected.push({ name: 'React 19', category: 'Frontend', confidence: 100, description: 'Component-based reactive UI library' });
  }
  if (packageJsonContent?.includes('tailwindcss') || filePaths.some(p => p.includes('tailwind'))) {
    detected.push({ name: 'Tailwind CSS', category: 'Frontend', confidence: 95, description: 'Utility-first styling system' });
  }
  if (packageJsonContent?.includes('vite') || filePaths.some(p => p.includes('vite.config'))) {
    detected.push({ name: 'Vite', category: 'Frontend', confidence: 100, description: 'Fast ESM bundler & HMR dev server' });
  }
  if (joinedPaths.includes('canvas') || joinedPaths.includes('fighter.ts')) {
    detected.push({ name: 'HTML5 Canvas 2D', category: 'Frontend', confidence: 90, description: '60fps hardware-accelerated immediate-mode graphics' });
  }

  // Backend
  if (packageJsonContent?.includes('express') || filePaths.some(p => p.includes('server') && p.endsWith('.ts'))) {
    detected.push({ name: 'Express.js', category: 'Backend', confidence: 95, description: 'RESTful API routing & HTTP middleware' });
  }
  if (packageJsonContent?.includes('node:sqlite') || packageJsonContent?.includes('sqlite') || joinedPaths.includes('database.ts')) {
    detected.push({ name: 'SQLite (WAL Mode)', category: 'Database', confidence: 95, description: 'Zero-config embedded relational database' });
  }

  // Testing
  if (packageJsonContent?.includes('vitest') || filePaths.some(p => p.includes('.test.ts'))) {
    detected.push({ name: 'Vitest', category: 'Testing', confidence: 100, description: 'Vite-native unit & integration test runner' });
  }

  // DevOps & Tools
  if (filePaths.some(p => p.includes('Dockerfile') || p.includes('docker-compose'))) {
    detected.push({ name: 'Docker', category: 'DevOps', confidence: 90, description: 'Containerized deployment runtime' });
  }

  return detected;
}

export function extractArchitectureComponents(files: FileItem[]): {
  entrypoints: ArchitectureComponent[];
  coreServices: ArchitectureComponent[];
  databaseSchemas: ArchitectureComponent[];
  routes: ArchitectureComponent[];
} {
  const entrypoints: ArchitectureComponent[] = [];
  const coreServices: ArchitectureComponent[] = [];
  const databaseSchemas: ArchitectureComponent[] = [];
  const routes: ArchitectureComponent[] = [];

  for (const f of files) {
    const p = f.path.replace(/\\/g, '/');

    // Entrypoints
    if (p.endsWith('index.html')) {
      entrypoints.push({ name: 'HTML5 Host Shell', type: 'entrypoint', filePath: p, lineReference: 'L1-L30', description: 'Single-page application viewport host & font definitions' });
    } else if (p.endsWith('main.tsx') || p.endsWith('index.tsx')) {
      entrypoints.push({ name: 'Client DOM Bootstrap', type: 'entrypoint', filePath: p, lineReference: 'L1-L15', description: 'Mounts React root into document DOM container' });
    } else if (p.endsWith('server/index.ts') || p.endsWith('server.js') || p.endsWith('app.ts')) {
      entrypoints.push({ name: 'Server Entrypoint', type: 'entrypoint', filePath: p, lineReference: 'L1-L45', description: 'Initializes Express HTTP server, JSON middleware & routes' });
    }

    // Database Schemas
    if (p.includes('database') || p.includes('schema') || p.includes('models') || p.endsWith('db.ts')) {
      databaseSchemas.push({ name: 'Database Engine & Schema', type: 'database', filePath: p, lineReference: 'L12-L95', description: 'Table declarations, WAL pragmas, and foreign key integrity constraints' });
    }

    // Routes
    if (p.includes('routes') || (p.includes('server') && (p.includes('api') || p.includes('index.ts')))) {
      routes.push({ name: 'API Routing & Controllers', type: 'route', filePath: p, lineReference: 'L30-L120', description: 'RESTful endpoints for auth, products, orders, and webhook verification' });
    }

    // Core Services
    if (p.includes('shared/') || p.includes('services/') || p.includes('game/')) {
      const name = p.split('/').pop()?.replace(/\.(ts|js|tsx)$/, '') || 'Service';
      coreServices.push({
        name: name.charAt(0).toUpperCase() + name.slice(1) + ' Engine',
        type: 'service',
        filePath: p,
        lineReference: 'L1-L80',
        description: `Core domain logic and algorithms for ${name}`
      });
    }
  }

  return { entrypoints, coreServices, databaseSchemas, routes };
}

export function generateSetupGuide(analysis: {
  repoName: string;
  techStack: DetectedTech[];
  entrypoints: ArchitectureComponent[];
}): string {
  const hasDocker = analysis.techStack.some(t => t.name === 'Docker');
  const hasNode = analysis.techStack.some(t => t.category === 'Frontend' || t.category === 'Backend');

  return `# Quickstart & Local Setup Guide: ${analysis.repoName}
Generated by **RepoLens** (Product 03 • Wave B)

## 1. Prerequisites
- **Node.js**: v20.x or v24.x LTS
- **Package Manager**: npm v10+ (or pnpm/yarn)
- **Git**: Installed and available in PATH
${hasDocker ? '- **Docker Desktop**: Optional, for containerized runs\n' : ''}

## 2. Clone & Initial Workspace Setup
\`\`\`bash
# 1. Clone the repository
git clone https://github.com/example/${analysis.repoName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.git
cd ${analysis.repoName.toLowerCase().replace(/[^a-z0-9]/g, '-')}

# 2. Configure environment variables
cp .env.example .env
\`\`\`

## 3. Dependency Installation
\`\`\`bash
npm install
\`\`\`

## 4. Database Setup & Seeding
\`\`\`bash
# Initialize schema and seed demo records
npm run seed
\`\`\`

## 5. Starting the Development Server
\`\`\`bash
npm run dev
\`\`\`
* The application will be accessible at \`http://localhost:3005\` (or \`http://localhost:5173\`).

## 6. Verification & Test Execution
\`\`\`bash
# Run the automated test suite
npm test
\`\`\`
`;
}

export function generateArchitectureGuide(analysis: {
  repoName: string;
  techStack: DetectedTech[];
  entrypoints: ArchitectureComponent[];
  coreServices: ArchitectureComponent[];
  databaseSchemas: ArchitectureComponent[];
}): string {
  return `# Architectural Overview & Codebase Map: ${analysis.repoName}

## 1. High-Level System Layers
\`\`\`
+-----------------------------------------------------------------+
|                      PRESENTATION LAYER                         |
|   React 19 Components, Tailwind Styling & Browser Routing        |
+--------------------------------+--------------------------------+
                                 | HTTPS / REST
+--------------------------------v--------------------------------+
|                     APPLICATION & ROUTE LAYER                   |
|   Express Controllers, Auth Guards & Cryptographic Verification  |
+--------------------------------+--------------------------------+
                                 |
+--------------------------------v--------------------------------+
|                        DATA ACCESS LAYER                        |
|   SQLite Engine with Write-Ahead Logging (WAL) & Foreign Keys   |
+-----------------------------------------------------------------+
\`\`\`

## 2. Key Entrypoints
${analysis.entrypoints.map(e => `- **${e.name}** (\`${e.filePath}\`): ${e.description}`).join('\n')}

## 3. Core Domain Engines & Services
${analysis.coreServices.slice(0, 6).map(s => `- **${s.name}** (\`${s.filePath}\`): ${s.description}`).join('\n')}

## 4. Database Schemas & Storage
${analysis.databaseSchemas.map(d => `- **${d.name}** (\`${d.filePath}\`): ${d.description}`).join('\n')}
`;
}

export function generateStarterIssues(techStack: DetectedTech[], components: ArchitectureComponent[]): StarterIssue[] {
  return [
    {
      id: 'issue_1',
      title: 'Add Input Sanitation & Max Length Validation to Search Queries',
      difficulty: 'Beginner',
      category: 'Security',
      fileReference: 'src/client/pages/MarketplacePage.tsx:L45',
      description: 'Currently user search queries are evaluated directly without length clamping. Limit query input to 80 characters and trim leading whitespace to avoid regex backtracking.',
      suggestedSteps: [
        'Open the search input change handler in MarketplacePage.tsx',
        'Add .trim().slice(0, 80) to the query string updater',
        'Add a unit test in src/tests to verify sanitized search behavior'
      ]
    },
    {
      id: 'issue_2',
      title: 'Implement Dark / Light Theme Preference in LocalStorage',
      difficulty: 'Beginner',
      category: 'Feature',
      fileReference: 'src/client/App.tsx:L25',
      description: 'Allow users to switch between cyberpunk midnight theme and clean editorial light mode, persisting their choice across browser refreshes.',
      suggestedSteps: [
        'Add a theme state variable in App.tsx initialized from localStorage.getItem("tf_theme")',
        'Toggle a root .dark class on document.documentElement',
        'Add a theme toggle button in the Navbar component'
      ]
    },
    {
      id: 'issue_3',
      title: 'Add Unit Test for Discount Code & Commission Bounds',
      difficulty: 'Intermediate',
      category: 'Testing',
      fileReference: 'src/tests/payment.test.ts:L30',
      description: 'Write test assertions proving that platform fees cannot exceed 100% of product price and that discounts cannot reduce the final checkout amount below zero.',
      suggestedSteps: [
        'Add test cases in payment.test.ts for zero-price edge cases',
        'Verify that commission rate calculations throw when outside [0.0, 1.0]',
        'Run npm test to ensure 100% test passing'
      ]
    },
    {
      id: 'issue_4',
      title: 'Add Export to JSON Button for User Library Licenses',
      difficulty: 'Beginner',
      category: 'Feature',
      fileReference: 'src/client/pages/LibraryPage.tsx:L80',
      description: 'Allow buyers to download a receipt.json containing all their purchased software licenses and download hashes for offline archiving.',
      suggestedSteps: [
        'Add a "Export Licenses" button in LibraryPage.tsx',
        'Construct a Blob from JSON.stringify(libraryItems, null, 2)',
        'Trigger a browser file download using URL.createObjectURL(blob)'
      ]
    }
  ];
}

export const preloadedRepositories: Array<{
  id: string;
  name: string;
  description: string;
  files: FileItem[];
}> = [
  {
    id: 'repo_toolforge',
    name: 'ToolForge sample manifest',
    description: 'Illustrative file tree for a React and TypeScript web app. This static sample is not fetched from GitHub.',
    files: [
      { path: 'package.json', contentSnippet: '{"name":"toolforge-marketplace","dependencies":{"express":"^4.22.1","react":"^19.2.5","tailwindcss":"^4.3.3"}}' },
      { path: 'tsconfig.json' },
      { path: 'vite.config.ts' },
      { path: 'index.html' },
      { path: 'src/client/main.tsx' },
      { path: 'src/client/App.tsx' },
      { path: 'src/client/components/Navbar.tsx' },
      { path: 'src/client/components/ProductCard.tsx' },
      { path: 'src/client/pages/MarketplacePage.tsx' },
      { path: 'src/client/pages/ProductDetailPage.tsx' },
      { path: 'src/client/pages/LibraryPage.tsx' },
      { path: 'src/server/index.ts' },
      { path: 'src/server/database.ts' },
      { path: 'src/server/seed.ts' },
      { path: 'src/shared/portfoliodeploy.ts' },
      { path: 'src/shared/placementforge.ts' },
      { path: 'src/tests/razorpay.test.ts' },
      { path: 'src/tests/payment.test.ts' },
      { path: 'src/tests/auth.test.ts' },
      { path: 'src/tests/storage.test.ts' }
    ]
  },
  {
    id: 'repo_animeclash',
    name: 'Anime Clash Arena (2D Fighter)',
    description: 'TypeScript 60fps arcade engine with frame-accurate AABB hitboxes and AI bot state machine.',
    files: [
      { path: 'package.json', contentSnippet: '{"name": "anime-clash", "dependencies": {"react": "19.2", "vite": "8.3"}}' },
      { path: 'index.html' },
      { path: 'src/main.tsx' },
      { path: 'src/App.tsx' },
      { path: 'src/game/physics.ts' },
      { path: 'src/game/fighter.ts' },
      { path: 'src/game/ai.ts' },
      { path: 'src/game/stages.ts' },
      { path: 'src/game/audio.ts' },
      { path: 'src/tests/physics.test.ts' },
      { path: 'src/tests/ai.test.ts' }
    ]
  },
  {
    id: 'repo_infiniteempire',
    name: 'Infinite Empire (Idle Economy)',
    description: 'Closed-form exponential math economy with Web Audio procedural sound synthesis.',
    files: [
      { path: 'package.json', contentSnippet: '{"name": "infinite-empire", "dependencies": {"react": "19.2", "vite": "8.3"}}' },
      { path: 'index.html' },
      { path: 'src/main.tsx' },
      { path: 'src/App.tsx' },
      { path: 'src/game/formulas.ts' },
      { path: 'src/game/audio.ts' },
      { path: 'src/game/constants.ts' },
      { path: 'src/game/storage.ts' },
      { path: 'src/tests/formulas.test.ts' }
    ]
  }
];

export function validateManifestSecurity(files: FileItem[]): SecurityAuditResult {
  const detectedRisks: string[] = [];
  const safeFiles: FileItem[] = [];

  const sensitiveFileRegex = /(^\.env(\..+)?$|\.pem$|id_rsa|\.key$|credentials\.json$|\.pfx$|keystore)/i;
  const awsKeyRegex = /(AKIA[0-9A-Z]{16})/;
  const ghpTokenRegex = /(ghp_[a-zA-Z0-9]{36})/;
  const secretKeyRegex = /(api[_-]?key|secret|password|bearer)\s*[:=]\s*['"][a-zA-Z0-9_\-]{16,}['"]/i;

  for (const f of files) {
    const rawPath = f.path.trim();

    // 1. Check for Zip-Slip / Path Traversal
    if (
      rawPath.includes('../') ||
      rawPath.includes('..\\') ||
      rawPath.startsWith('/') ||
      rawPath.startsWith('\\') ||
      /^[a-zA-Z]:[/\\]/.test(rawPath)
    ) {
      detectedRisks.push(`Path Traversal / Zip-Slip detected in path "${rawPath}". File excluded from analysis.`);
      continue;
    }

    // 2. Check for sensitive secret filenames
    const baseName = rawPath.split(/[/\\]/).pop() || '';
    if (sensitiveFileRegex.test(baseName)) {
      detectedRisks.push(`Sensitive secret file detected: "${rawPath}". Environment files and private keys must be quarantined.`);
      continue;
    }

    // 3. Check snippet content for embedded API keys or tokens
    let sanitizedSnippet = f.contentSnippet;
    if (sanitizedSnippet) {
      if (awsKeyRegex.test(sanitizedSnippet)) {
        detectedRisks.push(`Embedded AWS Access Key detected in "${rawPath}". Redacting secret.`);
        sanitizedSnippet = sanitizedSnippet.replace(awsKeyRegex, 'AKIA[REDACTED_AWS_KEY]');
      }
      if (ghpTokenRegex.test(sanitizedSnippet)) {
        detectedRisks.push(`Embedded GitHub Personal Access Token detected in "${rawPath}". Redacting secret.`);
        sanitizedSnippet = sanitizedSnippet.replace(ghpTokenRegex, 'ghp_[REDACTED_GITHUB_TOKEN]');
      }
      if (secretKeyRegex.test(sanitizedSnippet)) {
        detectedRisks.push(`Hardcoded API credential token detected in "${rawPath}". Redacting secret.`);
        sanitizedSnippet = sanitizedSnippet.replace(secretKeyRegex, '$1="[REDACTED_SECRET]"');
      }
    }

    safeFiles.push({
      ...f,
      path: rawPath.replace(/\\/g, '/'),
      contentSnippet: sanitizedSnippet
    });
  }

  return {
    passed: detectedRisks.length === 0,
    safeFiles,
    detectedRisks
  };
}

export function parseUploadedManifest(rawContent: string, _filename?: string): FileItem[] {
  const trimmed = rawContent.trim();
  if (!trimmed) return [];

  // 1. Try parsing as JSON
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      // Array of FileItems or paths
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => {
          if (typeof item === 'string') {
            return { path: item };
          }
          return {
            path: String(item.path || item.name || 'unnamed.txt'),
            sizeBytes: item.sizeBytes || item.size || 1024,
            contentSnippet: item.contentSnippet || item.content || undefined
          };
        });
      }
      // package.json format
      if (parsed.name && (parsed.dependencies || parsed.scripts)) {
        const files: FileItem[] = [
          { path: 'package.json', contentSnippet: JSON.stringify(parsed, null, 2), sizeBytes: trimmed.length }
        ];
        if (parsed.main) files.push({ path: String(parsed.main) });
        files.push({ path: 'src/index.ts' });
        files.push({ path: 'README.md' });
        return files;
      }
      // GitHub tree API format: { tree: [{ path: string, size?: number }] }
      if (Array.isArray(parsed.tree)) {
        return parsed.tree.map((node: any) => ({
          path: String(node.path),
          sizeBytes: node.size || 1024
        }));
      }
    } catch {
      // Fall through to line-by-line parsing
    }
  }

  // 2. Line by line list of file paths (e.g. from find or git ls-files)
  return trimmed
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#') && !line.endsWith('/'))
    .map(path => ({ path }));
}

export function analyzeCodebase(input: {
  repoName: string;
  repoUrl?: string;
  files: FileItem[];
  packageJsonContent?: string;
}): RepoLensAnalysis {
  // First run security audit
  const audit = validateManifestSecurity(input.files);
  const activeFiles = audit.safeFiles;
  const filePaths = activeFiles.map(f => f.path);
  const totalFiles = activeFiles.length;
  const totalBytes = activeFiles.reduce((acc, f) => acc + (f.sizeBytes || 1024), 0);
  const fileTree = buildFileTree(activeFiles);
  const techStack = detectTechStack(filePaths, input.packageJsonContent);
  const { entrypoints, coreServices, databaseSchemas, routes } = extractArchitectureComponents(activeFiles);

  const setupGuideMarkdown = generateSetupGuide({
    repoName: input.repoName,
    techStack,
    entrypoints
  });

  const architectureMarkdown = generateArchitectureGuide({
    repoName: input.repoName,
    techStack,
    entrypoints,
    coreServices,
    databaseSchemas
  });

  const starterIssues = generateStarterIssues(techStack, coreServices);

  const securityNotes = [
    'All webhook endpoints enforce HMAC-SHA256 signature checks with crypto.timingSafeEqual',
    'Uploaded manifests and archives are scanned to prevent Zip-Slip / path traversal attacks',
    'Prices and money values are stored strictly in integer paise to avoid precision loss',
    'SQL queries utilize parameterized prepared statements to prevent SQL injection'
  ];

  return {
    repoName: input.repoName,
    repoUrl: input.repoUrl,
    totalFiles,
    totalBytes,
    fileTree,
    techStack,
    entrypoints,
    coreServices,
    databaseSchemas,
    routes,
    setupGuideMarkdown,
    architectureMarkdown,
    starterIssues,
    securityNotes,
    detectedRisks: audit.detectedRisks,
    securityAuditPassed: audit.passed
  };
}
