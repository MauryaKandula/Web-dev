export interface GitHubUserProfile {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  location: string;
  blog?: string;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  homepage?: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  topics?: string[];
  updated_at: string;
}

export interface PortfolioData {
  username: string;
  name: string;
  avatarUrl: string;
  bio: string;
  location: string;
  websiteUrl?: string;
  githubUrl: string;
  totalRepos: number;
  totalStars: number;
  followers: number;
  topLanguages: Array<{ language: string; count: number; percentage: number }>;
  projects: Array<{
    id: string;
    title: string;
    description: string;
    repoUrl: string;
    demoUrl?: string;
    language: string;
    stars: number;
    forks: number;
    tags: string[];
  }>;
}

export function mapGitHubDataToPortfolio(
  user: Partial<GitHubUserProfile>,
  repos: Partial<GitHubRepo>[]
): PortfolioData {
  const username = user.login || 'developer';
  const name = user.name || user.login || 'CSE Software Engineer';
  const avatarUrl = user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;
  const bio = user.bio || 'Computer Science & Engineering Student | Building robust distributed systems and web software.';
  const location = user.location || 'India';
  const websiteUrl = user.blog || undefined;
  const githubUrl = user.html_url || `https://github.com/${username}`;

  // Process repos
  const validRepos = (repos || []).filter(r => r && typeof r.name === 'string' && !r.name.includes('.github'));

  // Calculate languages and stars
  const langCounts: Record<string, number> = {};
  let totalStars = 0;

  const projects = validRepos.map((r, idx) => {
    const lang = r.language || 'Code';
    if (r.language) {
      langCounts[r.language] = (langCounts[r.language] || 0) + 1;
    }
    const stars = Number(r.stargazers_count) || 0;
    const forks = Number(r.forks_count) || 0;
    totalStars += stars;

    const tags = Array.isArray(r.topics) && r.topics.length > 0
      ? r.topics.slice(0, 4)
      : [lang, 'Open Source'];

    return {
      id: `proj_${r.id || idx}`,
      title: (r.name || 'project').replace(/[-_]/g, ' '),
      description: r.description || 'Full-stack software application with automated tests, responsive UI, and verified performance.',
      repoUrl: r.html_url || `https://github.com/${username}/${r.name}`,
      demoUrl: r.homepage || undefined,
      language: lang,
      stars,
      forks,
      tags
    };
  });

  const totalLangRepos = Object.values(langCounts).reduce((a, b) => a + b, 0) || 1;
  const topLanguages = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([language, count]) => ({
      language,
      count,
      percentage: Math.round((count / totalLangRepos) * 100)
    }));

  return {
    username,
    name,
    avatarUrl,
    bio,
    location,
    websiteUrl,
    githubUrl,
    totalRepos: user.public_repos !== undefined ? user.public_repos : validRepos.length,
    totalStars,
    followers: user.followers || 0,
    topLanguages,
    projects
  };
}

export function escapeHtml(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function sanitizeUrl(url?: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (/^(?:https?:\/\/|\/|#)/i.test(trimmed)) {
    return escapeHtml(trimmed);
  }
  return '#';
}

function makeCrcTable(): Uint32Array {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
}

const crcTable = makeCrcTable();

export function crc32(buf: Uint8Array): number {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

export interface ZipFileEntry {
  name: string;
  data: string | Uint8Array;
}

export function buildZipArchive(files: ZipFileEntry[]): Uint8Array {
  const encoder = new TextEncoder();
  const fileRecords: Array<{
    nameBytes: Uint8Array;
    dataBytes: Uint8Array;
    crc: number;
    offset: number;
  }> = [];

  let totalSize = 0;

  for (const f of files) {
    const nameBytes = encoder.encode(f.name);
    const dataBytes = typeof f.data === 'string' ? encoder.encode(f.data) : f.data;
    const crc = crc32(dataBytes);
    const offset = totalSize;
    totalSize += 30 + nameBytes.length + dataBytes.length;
    fileRecords.push({ nameBytes, dataBytes, crc, offset });
  }

  const centralDirOffset = totalSize;
  let centralDirSize = 0;
  for (const r of fileRecords) {
    centralDirSize += 46 + r.nameBytes.length;
  }
  totalSize += centralDirSize + 22;

  const out = new Uint8Array(totalSize);
  const view = new DataView(out.buffer, out.byteOffset, out.byteLength);

  let cursor = 0;

  // 1. Write Local Headers & File Data
  for (const r of fileRecords) {
    view.setUint32(cursor, 0x04034b50, true);
    view.setUint16(cursor + 4, 20, true);
    view.setUint16(cursor + 6, 0x0800, true); // UTF-8
    view.setUint16(cursor + 8, 0, true);      // Store
    view.setUint16(cursor + 10, 0, true);
    view.setUint16(cursor + 12, 0x5241, true); // 2021-02-01
    view.setUint32(cursor + 14, r.crc, true);
    view.setUint32(cursor + 18, r.dataBytes.length, true);
    view.setUint32(cursor + 22, r.dataBytes.length, true);
    view.setUint16(cursor + 26, r.nameBytes.length, true);
    view.setUint16(cursor + 28, 0, true);
    cursor += 30;

    out.set(r.nameBytes, cursor);
    cursor += r.nameBytes.length;

    out.set(r.dataBytes, cursor);
    cursor += r.dataBytes.length;
  }

  // 2. Write Central Directory Headers
  for (const r of fileRecords) {
    view.setUint32(cursor, 0x02014b50, true);
    view.setUint16(cursor + 4, 20, true);
    view.setUint16(cursor + 6, 20, true);
    view.setUint16(cursor + 8, 0x0800, true);
    view.setUint16(cursor + 10, 0, true);
    view.setUint16(cursor + 12, 0, true);
    view.setUint16(cursor + 14, 0x5241, true);
    view.setUint32(cursor + 16, r.crc, true);
    view.setUint32(cursor + 20, r.dataBytes.length, true);
    view.setUint32(cursor + 24, r.dataBytes.length, true);
    view.setUint16(cursor + 28, r.nameBytes.length, true);
    view.setUint16(cursor + 30, 0, true);
    view.setUint16(cursor + 32, 0, true);
    view.setUint16(cursor + 34, 0, true);
    view.setUint16(cursor + 36, 0, true);
    view.setUint32(cursor + 38, 0, true);
    view.setUint32(cursor + 42, r.offset, true);
    cursor += 46;

    out.set(r.nameBytes, cursor);
    cursor += r.nameBytes.length;
  }

  // 3. Write End of Central Directory Record (EOCD)
  view.setUint32(cursor, 0x06054b50, true);
  view.setUint16(cursor + 4, 0, true);
  view.setUint16(cursor + 6, 0, true);
  view.setUint16(cursor + 8, fileRecords.length, true);
  view.setUint16(cursor + 10, fileRecords.length, true);
  view.setUint32(cursor + 12, centralDirSize, true);
  view.setUint32(cursor + 16, centralDirOffset, true);
  view.setUint16(cursor + 20, 0, true);

  return out;
}

export function getThemeStyles(theme: 'cyberpunk' | 'editorial' = 'cyberpunk', isLicensed: boolean = false): string {
  const isDark = theme === 'cyberpunk';
  const themeVars = isDark ? `
    :root {
      --bg: #070b14;
      --card-bg: rgba(15, 23, 42, 0.7);
      --card-border: rgba(30, 41, 59, 0.8);
      --card-hover: rgba(14, 165, 233, 0.4);
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #00e5ff;
      --accent-glow: rgba(0, 229, 255, 0.25);
      --tag-bg: rgba(14, 165, 233, 0.12);
      --tag-text: #38bdf8;
    }
  ` : `
    :root {
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --card-border: #e2e8f0;
      --card-hover: #cbd5e1;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --accent: #2563eb;
      --accent-glow: rgba(37, 99, 235, 0.15);
      --tag-bg: #eff6ff;
      --tag-text: #1d4ed8;
    }
  `;

  return `${themeVars}
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text-main);
      line-height: 1.6;
      padding-bottom: 60px;
      word-break: break-word;
      overflow-wrap: anywhere;
    }
    .container {
      max-width: 1040px;
      margin: 0 auto;
      padding: 40px 24px;
    }
    header {
      display: flex;
      flex-direction: column;
      gap: 24px;
      padding-bottom: 40px;
      border-bottom: 1px solid var(--card-border);
      margin-bottom: 40px;
    }
    @media (min-width: 640px) {
      header {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
    }
    .profile-info {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .avatar {
      width: 88px;
      height: 88px;
      border-radius: 20px;
      object-fit: cover;
      border: 2px solid var(--accent);
      box-shadow: 0 0 20px var(--accent-glow);
    }
    .headline h1 {
      font-size: 1.85rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .headline p {
      color: var(--text-muted);
      font-size: 0.95rem;
      margin-top: 4px;
      max-width: 600px;
    }
    .stats-row {
      display: flex;
      gap: 16px;
      margin-top: 12px;
      font-size: 0.85rem;
      color: var(--text-muted);
      flex-wrap: wrap;
    }
    .stats-row span strong {
      color: var(--text-main);
    }
    .social-links {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
    }
    .social-btn {
      display: inline-flex;
      align-items: center;
      padding: 8px 16px;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 600;
      text-decoration: none;
      color: var(--text-main);
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      transition: all 0.2s ease;
    }
    .social-btn:hover {
      border-color: var(--accent);
      color: var(--accent);
    }
    .languages-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 32px;
    }
    .lang-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 999px;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      font-size: 0.8rem;
      font-weight: 600;
    }
    .lang-pct {
      color: var(--accent);
      font-size: 0.75rem;
    }
    .section-title {
      font-size: 1.3rem;
      font-weight: 700;
      margin-bottom: 20px;
      letter-spacing: -0.01em;
    }
    .projects-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
    }
    @media (min-width: 640px) {
      .projects-grid { grid-template-columns: repeat(2, 1fr); }
    }
    .project-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .project-card:hover {
      transform: translateY(-2px);
      border-color: var(--card-hover);
      box-shadow: 0 8px 24px var(--accent-glow);
    }
    .project-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 8px;
    }
    .project-title {
      font-size: 1.1rem;
      font-weight: 700;
      text-transform: capitalize;
    }
    .project-lang {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 6px;
      background: var(--tag-bg);
      color: var(--tag-text);
    }
    .project-desc {
      color: var(--text-muted);
      font-size: 0.88rem;
      margin-bottom: 16px;
      line-height: 1.5;
    }
    .project-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 18px;
    }
    .tag {
      font-size: 0.72rem;
      color: var(--text-muted);
      background: var(--tag-bg);
      padding: 2px 8px;
      border-radius: 4px;
    }
    .project-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 14px;
      border-top: 1px solid var(--card-border);
      font-size: 0.8rem;
    }
    .project-stats {
      display: flex;
      gap: 12px;
      color: var(--text-muted);
    }
    .project-links {
      display: flex;
      gap: 8px;
    }
    .link-btn {
      padding: 5px 12px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-main);
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      transition: all 0.2s ease;
    }
    .link-btn:hover {
      border-color: var(--accent);
      color: var(--accent);
    }
    .link-btn.primary {
      background: var(--accent);
      color: #070b14;
      border-color: var(--accent);
    }
    .empty-projects {
      padding: 40px;
      text-align: center;
      background: var(--card-bg);
      border: 1px dashed var(--card-border);
      border-radius: 16px;
      color: var(--text-muted);
    }
    ${isLicensed ? '' : `
    .watermark-banner {
      margin-top: 48px;
      text-align: center;
      padding: 16px;
      font-size: 0.8rem;
      color: var(--text-muted);
      border-top: 1px dashed var(--card-border);
    }
    .watermark-banner a {
      color: var(--accent);
      text-decoration: none;
      font-weight: 600;
    }`}
  `;
}

export function generateStaticPortfolioBundle(
  portfolio: PortfolioData,
  theme: 'cyberpunk' | 'editorial' = 'cyberpunk',
  isLicensed: boolean = false
): string {
  const styles = getThemeStyles(theme, isLicensed);

  const projectsHtml = portfolio.projects.length === 0
    ? `<div class="empty-projects"><p>No public engineering projects showcased yet.</p></div>`
    : portfolio.projects.map(p => `
    <article class="project-card" data-lang="${escapeHtml(p.language.toLowerCase())}">
      <div class="project-header">
        <h3 class="project-title">${escapeHtml(p.title)}</h3>
        <span class="project-lang">${escapeHtml(p.language)}</span>
      </div>
      <p class="project-desc">${escapeHtml(p.description)}</p>
      <div class="project-tags">
        ${p.tags.map(t => `<span class="tag">#${escapeHtml(t)}</span>`).join('')}
      </div>
      <div class="project-footer">
        <div class="project-stats">
          <span>⭐ ${Number(p.stars) || 0}</span>
          <span>🍴 ${Number(p.forks) || 0}</span>
        </div>
        <div class="project-links">
          ${p.demoUrl ? `<a href="${sanitizeUrl(p.demoUrl)}" target="_blank" rel="noopener" class="link-btn primary">Live Demo ↗</a>` : ''}
          <a href="${sanitizeUrl(p.repoUrl)}" target="_blank" rel="noopener" class="link-btn">Code ↗</a>
        </div>
      </div>
    </article>
  `).join('');

  const languagesHtml = portfolio.topLanguages.map(l => `
    <div class="lang-pill">
      <span class="lang-name">${escapeHtml(l.language)}</span>
      <span class="lang-pct">${Number(l.percentage) || 0}%</span>
    </div>
  `).join('');

  const watermarkHtml = isLicensed ? '' : `
    <div class="watermark-banner">
      ⚡ Built with <strong>PortfolioDeploy</strong> on <a href="https://toolforge.dev" target="_blank" rel="noopener">ToolForge Marketplace</a>
    </div>
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(portfolio.name)} — Software Engineering Portfolio</title>
  <meta name="description" content="${escapeHtml(portfolio.bio)}">
  <meta property="og:title" content="${escapeHtml(portfolio.name)} — Developer Portfolio">
  <meta property="og:description" content="${escapeHtml(portfolio.bio)}">
  <meta property="og:image" content="${sanitizeUrl(portfolio.avatarUrl)}">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(portfolio.name)} | Developer Portfolio">
  <meta name="twitter:description" content="${escapeHtml(portfolio.bio)}">
  <meta name="twitter:image" content="${sanitizeUrl(portfolio.avatarUrl)}">
  <style>
${styles}
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="profile-info">
        <img src="${sanitizeUrl(portfolio.avatarUrl)}" alt="${escapeHtml(portfolio.name)}" class="avatar">
        <div class="headline">
          <h1>${escapeHtml(portfolio.name)}</h1>
          <p>${escapeHtml(portfolio.bio)}</p>
          <div class="stats-row">
            <span>📍 ${escapeHtml(portfolio.location)}</span>
            <span>📦 <strong>${Number(portfolio.totalRepos) || 0}</strong> Repos</span>
            <span>⭐ <strong>${Number(portfolio.totalStars) || 0}</strong> Stars</span>
            <span>👥 <strong>${Number(portfolio.followers) || 0}</strong> Followers</span>
          </div>
        </div>
      </div>
      <div class="social-links">
        <a href="${sanitizeUrl(portfolio.githubUrl)}" target="_blank" rel="noopener" class="social-btn">GitHub Profile ↗</a>
        ${portfolio.websiteUrl ? `<a href="${sanitizeUrl(portfolio.websiteUrl)}" target="_blank" rel="noopener" class="social-btn">Website ↗</a>` : ''}
      </div>
    </header>

    <div class="languages-bar">
      ${languagesHtml}
    </div>

    <h2 class="section-title">Featured Engineering Projects (${portfolio.projects.length})</h2>
    <div class="projects-grid">
      ${projectsHtml}
    </div>

    ${watermarkHtml}
  </div>
</body>
</html>`;
}

export function generateStaticPortfolioZipBundle(
  portfolio: PortfolioData,
  theme: 'cyberpunk' | 'editorial' = 'cyberpunk',
  isLicensed: boolean = false
): Uint8Array {
  const standaloneHtml = generateStaticPortfolioBundle(portfolio, theme, isLicensed);
  const css = getThemeStyles(theme, isLicensed);
  const json = JSON.stringify(portfolio, null, 2);
  const readme = `# ${portfolio.name} — Engineering Portfolio

Generated with **PortfolioDeploy** (Product 06 • Wave A).

## 🚀 One-Click Hosting Options

### 1. GitHub Pages (100% Free)
1. Create a GitHub repository named \`${portfolio.username}.github.io\`
2. Upload \`index.html\` (or all files in this bundle) to the repository
3. Your portfolio will be live at \`https://${portfolio.username}.github.io\`

### 2. Vercel Drag & Drop (100% Free)
1. Go to [vercel.com/new](https://vercel.com/new)
2. Drag and drop this extracted folder
3. Vercel deploys with automatic HTTPS and edge CDN caching in ~30 seconds

### 3. Local Offline Preview
Simply double-click \`index.html\` in any browser (Chrome, Edge, Firefox, Safari).
No web server or internet connection is required.
`;

  return buildZipArchive([
    { name: 'index.html', data: standaloneHtml },
    { name: 'styles.css', data: css },
    { name: 'portfolio.json', data: json },
    { name: 'README.md', data: readme }
  ]);
}

export const sampleGitHubUser: GitHubUserProfile = {
  login: 'arjunverma-dev',
  name: 'Demo Creator',
  avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun',
  bio: 'CSE Undergrad & Systems Enthusiast. Focused on high-throughput microservices, WebAssembly, and local LLM toolchains.',
  location: 'Bengaluru, Karnataka, India',
  blog: 'https://arjunverma.dev',
  public_repos: 18,
  followers: 142,
  following: 86,
  html_url: 'https://github.com/arjunverma-dev'
};

export const sampleGitHubRepos: GitHubRepo[] = [
  {
    id: 101,
    name: 'Distributed-Task-Queue-Go',
    description: 'High-throughput fault-tolerant task queue with Redis lease heartbeat, exponential backoff, and dead-letter exchange.',
    html_url: 'https://github.com/arjunverma-dev/distributed-task-queue-go',
    homepage: 'https://taskqueue-demo.devforge.in',
    language: 'Go',
    stargazers_count: 84,
    forks_count: 19,
    topics: ['go', 'distributed-systems', 'redis', 'microservices'],
    updated_at: '2026-10-28T14:20:00Z'
  },
  {
    id: 102,
    name: 'TitanVAD-Audio-Synthesizer',
    description: 'Low-latency Voice Activity Detection and Web Audio API synthesizer for real-time streaming AI voice assistants.',
    html_url: 'https://github.com/arjunverma-dev/titanvad-audio-synthesizer',
    homepage: 'https://vad-audio.devforge.in',
    language: 'TypeScript',
    stargazers_count: 126,
    forks_count: 31,
    topics: ['webaudio', 'vad', 'typescript', 'realtime-audio'],
    updated_at: '2026-10-30T09:15:00Z'
  },
  {
    id: 103,
    name: 'Microservices-Auth-Engine',
    description: 'Zero-trust JWT authentication gateway with Ed25519 asymmetric signatures, role-based access control, and rate limiting.',
    html_url: 'https://github.com/arjunverma-dev/microservices-auth-engine',
    homepage: '',
    language: 'TypeScript',
    stargazers_count: 47,
    forks_count: 8,
    topics: ['auth', 'jwt', 'security', 'express'],
    updated_at: '2026-10-15T18:00:00Z'
  },
  {
    id: 104,
    name: 'Kavya-LLM-Inference-Bench',
    description: 'Automated benchmarking suite for local 7B-14B LLMs measuring time-to-first-token (TTFT) and token streaming stability.',
    html_url: 'https://github.com/arjunverma-dev/kavya-llm-inference-bench',
    homepage: '',
    language: 'Python',
    stargazers_count: 62,
    forks_count: 12,
    topics: ['llm', 'benchmarking', 'python', 'inference'],
    updated_at: '2026-10-22T11:45:00Z'
  }
];
