import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';
import {
  mapGitHubDataToPortfolio,
  generateStaticPortfolioBundle,
  generateStaticPortfolioZipBundle,
  escapeHtml,
  sanitizeUrl,
  sampleGitHubUser,
  sampleGitHubRepos,
  PortfolioData
} from '../shared/portfoliodeploy.ts';

describe('Product 06: PortfolioDeploy Showcase & Static Bundle Exporter', () => {
  describe('GitHub Data Mapping to Portfolio Schema', () => {
    it('accurately normalizes sample GitHub profile and repo statistics', () => {
      const portfolio = mapGitHubDataToPortfolio(sampleGitHubUser, sampleGitHubRepos);

      expect(portfolio.username).toBe('arjunverma-dev');
      expect(portfolio.name).toBe('Demo Creator');
      expect(portfolio.totalStars).toBe(84 + 126 + 47 + 62);
      expect(portfolio.projects).toHaveLength(4);
      expect(portfolio.topLanguages.length).toBeGreaterThan(0);
      expect(portfolio.topLanguages[0].percentage).toBeGreaterThan(0);
    });

    it('handles sparse or missing GitHub user fields with sensible defaults', () => {
      const sparseUser = {
        login: 'student-cse'
      };
      const sparseRepos = [
        {
          id: 501,
          name: 'algo-practice',
          language: 'Java',
          stargazers_count: 5
        }
      ];

      const portfolio = mapGitHubDataToPortfolio(sparseUser, sparseRepos);

      expect(portfolio.username).toBe('student-cse');
      expect(portfolio.name).toBe('student-cse');
      expect(portfolio.avatarUrl).toContain('dicebear.com');
      expect(portfolio.bio).toContain('Computer Science');
      expect(portfolio.location).toBe('India');
      expect(portfolio.projects[0].title).toBe('algo practice');
      expect(portfolio.projects[0].language).toBe('Java');
      expect(portfolio.totalStars).toBe(5);
    });

    it('filters out internal and hidden repository configurations like .github', () => {
      const reposWithInternal = [
        ...sampleGitHubRepos,
        {
          id: 999,
          name: '.github',
          language: 'Markdown',
          stargazers_count: 1
        }
      ];

      const portfolio = mapGitHubDataToPortfolio(sampleGitHubUser, reposWithInternal);
      expect(portfolio.projects.some(p => p.title.includes('.github'))).toBe(false);
      expect(portfolio.projects).toHaveLength(4);
    });

    it('calculates top language distribution percentages summing up accurately', () => {
      const portfolio = mapGitHubDataToPortfolio(sampleGitHubUser, sampleGitHubRepos);

      const totalPercentage = portfolio.topLanguages.reduce((sum, l) => sum + l.percentage, 0);
      // Because TypeScript, Go, Python are present: 2 TS, 1 Go, 1 Python -> 50% TS, 25% Go, 25% Python = 100%
      expect(totalPercentage).toBe(100);
    });
  });

  describe('Static Standalone HTML Bundle Generator', () => {
    let portfolio: PortfolioData;

    beforeEach(() => {
      portfolio = mapGitHubDataToPortfolio(sampleGitHubUser, sampleGitHubRepos);
    });

    it('generates a complete, valid standalone HTML5 document', () => {
      const bundle = generateStaticPortfolioBundle(portfolio, 'cyberpunk', true);

      expect(bundle).toContain('<!DOCTYPE html>');
      expect(bundle).toContain('<html lang="en">');
      expect(bundle).toContain('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
      expect(bundle).toContain(`<title>${portfolio.name} — Software Engineering Portfolio</title>`);
      expect(bundle).toContain('</html>');
    });

    it('embeds OpenGraph and Twitter card social preview meta tags', () => {
      const bundle = generateStaticPortfolioBundle(portfolio, 'cyberpunk', true);

      expect(bundle).toContain('<meta property="og:title"');
      expect(bundle).toContain('<meta property="og:description"');
      expect(bundle).toContain('<meta property="og:image"');
      expect(bundle).toContain('<meta name="twitter:card"');
    });

    it('applies Cyberpunk Dark Mode CSS variable tokens when selected', () => {
      const bundle = generateStaticPortfolioBundle(portfolio, 'cyberpunk', true);

      expect(bundle).toContain('--bg: #070b14');
      expect(bundle).toContain('--accent: #00e5ff');
    });

    it('applies Clean Editorial Mode CSS variable tokens when selected', () => {
      const bundle = generateStaticPortfolioBundle(portfolio, 'editorial', true);

      expect(bundle).toContain('--bg: #f8fafc');
      expect(bundle).toContain('--accent: #2563eb');
    });

    it('renders all featured project cards with stars, forks, and live links', () => {
      const bundle = generateStaticPortfolioBundle(portfolio, 'cyberpunk', true);

      for (const proj of portfolio.projects) {
        expect(bundle).toContain(proj.title);
        expect(bundle).toContain(proj.language);
      }
      expect(bundle).toContain('Live Demo ↗');
      expect(bundle).toContain('Code ↗');
    });

    it('includes ToolForge watermark attribution in free unpurchased mode', () => {
      const freeBundle = generateStaticPortfolioBundle(portfolio, 'cyberpunk', false);
      expect(freeBundle).toContain('watermark-banner');
      expect(freeBundle).toContain('PortfolioDeploy');
      expect(freeBundle).toContain('ToolForge Marketplace');
    });

    it('completely removes watermark banner for licensed pro buyers (100% white-label)', () => {
      const proBundle = generateStaticPortfolioBundle(portfolio, 'cyberpunk', true);
      expect(proBundle).not.toContain('watermark-banner');
      expect(proBundle).not.toContain('Built with <strong>PortfolioDeploy</strong>');
    });

    it('sanitizes malicious script and HTML injections to prevent XSS attacks in exported bundles', () => {
      const xssPortfolio: PortfolioData = {
        ...portfolio,
        name: 'Hacker <script>alert(1)</script>',
        bio: 'Bio with <img src=x onerror=alert("xss")> payload',
        githubUrl: 'javascript:alert("evil")',
        websiteUrl: 'https://legit-site.com',
        projects: [
          {
            id: 'p_xss',
            title: 'Malicious " onmouseover="alert(1)',
            description: '<script>evil()</script> description',
            repoUrl: 'javascript:alert("p_evil")',
            demoUrl: 'https://demo.com',
            language: 'JavaScript',
            stars: 10,
            forks: 2,
            tags: ['<script>tag</script>']
          }
        ]
      };

      const bundle = generateStaticPortfolioBundle(xssPortfolio, 'cyberpunk', true);

      // Must NOT contain unescaped script tags or inline attribute handlers
      expect(bundle).not.toContain('<script>alert(1)</script>');
      expect(bundle).not.toContain('<img src=x onerror=alert("xss")>');
      expect(bundle).not.toContain('<script>evil()</script>');
      expect(bundle).not.toContain('href="javascript:');

      // Must contain properly escaped HTML entities
      expect(bundle).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
      expect(bundle).toContain('&lt;img src=x onerror=alert(&quot;xss&quot;)&gt;');
      expect(bundle).toContain('&lt;script&gt;evil()&lt;/script&gt;');
    });

    it('renders clean fallback empty state when portfolio has zero public repositories', () => {
      const emptyPortfolio: PortfolioData = {
        ...portfolio,
        projects: [],
        totalRepos: 0,
        totalStars: 0,
        topLanguages: []
      };

      const bundle = generateStaticPortfolioBundle(emptyPortfolio, 'cyberpunk', true);
      expect(bundle).toContain('empty-projects');
      expect(bundle).toContain('No public engineering projects showcased yet');
    });
  });

  describe('Static Site Zip Bundle Archive Generator (Pure TS PKZip)', () => {
    let portfolio: PortfolioData;

    beforeEach(() => {
      portfolio = mapGitHubDataToPortfolio(sampleGitHubUser, sampleGitHubRepos);
    });

    it('generates a valid binary PKZip archive with 0x04034b50 signature', () => {
      const zipBytes = generateStaticPortfolioZipBundle(portfolio, 'cyberpunk', true);

      expect(zipBytes).toBeInstanceOf(Uint8Array);
      expect(zipBytes.length).toBeGreaterThan(500);

      // Verify standard PKzip local file header signature: PK\x03\x04 (0x50, 0x4B, 0x03, 0x04)
      expect(zipBytes[0]).toBe(0x50);
      expect(zipBytes[1]).toBe(0x4B);
      expect(zipBytes[2]).toBe(0x03);
      expect(zipBytes[3]).toBe(0x04);
    });

    it('includes index.html, styles.css, portfolio.json, and README.md in the zip archive', () => {
      const zipBytes = generateStaticPortfolioZipBundle(portfolio, 'cyberpunk', true);
      const textDecoder = new TextDecoder();
      const rawString = textDecoder.decode(zipBytes);

      expect(rawString).toContain('index.html');
      expect(rawString).toContain('styles.css');
      expect(rawString).toContain('portfolio.json');
      expect(rawString).toContain('README.md');
      expect(rawString).toContain('GitHub Pages');
      expect(rawString).toContain('Vercel');
    });

    it('omits white-label watermark in pro licensed zip bundle export', () => {
      const zipBytes = generateStaticPortfolioZipBundle(portfolio, 'cyberpunk', true);
      const textDecoder = new TextDecoder();
      const rawString = textDecoder.decode(zipBytes);

      expect(rawString).not.toContain('watermark-banner');
      expect(rawString).not.toContain('Built with <strong>PortfolioDeploy</strong>');
    });

    it('can be cleanly extracted by native OS zip utilities (PowerShell Expand-Archive)', () => {
      const zipBytes = generateStaticPortfolioZipBundle(portfolio, 'editorial', false);
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'portfoliodeploy-zip-test-'));
      const zipPath = path.join(tmpDir, 'bundle.zip');
      const outDir = path.join(tmpDir, 'extracted');

      try {
        fs.writeFileSync(zipPath, Buffer.from(zipBytes));

        // Execute native PowerShell expansion on Windows to verify RFC 1951 / PKZip standard conformance
        const cmd = `powershell -NoProfile -Command "Expand-Archive -LiteralPath '${zipPath.replace(/'/g, "''")}' -DestinationPath '${outDir.replace(/'/g, "''")}'"`;
        execSync(cmd, { stdio: 'pipe' });

        expect(fs.existsSync(path.join(outDir, 'index.html'))).toBe(true);
        expect(fs.existsSync(path.join(outDir, 'styles.css'))).toBe(true);
        expect(fs.existsSync(path.join(outDir, 'portfolio.json'))).toBe(true);
        expect(fs.existsSync(path.join(outDir, 'README.md'))).toBe(true);

        const extractedHtml = fs.readFileSync(path.join(outDir, 'index.html'), 'utf-8');
        expect(extractedHtml).toContain('<!DOCTYPE html>');
        expect(extractedHtml).toContain('Demo Creator');
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });
  });

  describe('Sanitization & Security Unit Utilities', () => {
    it('escapes &, <, >, ", and single quotes', () => {
      expect(escapeHtml('<div class="box">&\'test\'</div>')).toBe(
        '&lt;div class=&quot;box&quot;&gt;&amp;&#039;test&#039;&lt;/div&gt;'
      );
    });

    it('sanitizes dangerous javascript: URLs to safe fallback', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('#');
      expect(sanitizeUrl('  javascript:void(0)  ')).toBe('#');
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('#');
      expect(sanitizeUrl('https://github.com/developer')).toBe('https://github.com/developer');
      expect(sanitizeUrl('http://mysite.in')).toBe('http://mysite.in');
      expect(sanitizeUrl('#projects')).toBe('#projects');
    });

    it('handles non-string repo names gracefully in mapGitHubDataToPortfolio', () => {
      const malformedRepos: any = [
        { id: 1, name: null },
        { id: 2, name: 12345 },
        null,
        undefined,
        { id: 3, name: 'valid-repo', language: 'Go' }
      ];

      const res = mapGitHubDataToPortfolio({ login: 'test' }, malformedRepos);
      expect(res.projects).toHaveLength(1);
      expect(res.projects[0].title).toBe('valid repo');
    });
  });
});
