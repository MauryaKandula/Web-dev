import { describe, it, expect } from 'vitest';
import {
  preloadedRepositories,
  buildFileTree,
  detectTechStack,
  extractArchitectureComponents,
  generateSetupGuide,
  generateArchitectureGuide,
  generateStarterIssues,
  analyzeCodebase,
  validateManifestSecurity,
  parseUploadedManifest
} from '../shared/repolens.ts';

describe('RepoLens (Product 03 • Wave B)', () => {
  it('supplies 3 preloaded project repositories for zero-config onboarding', () => {
    expect(preloadedRepositories.length).toBe(3);
    const names = preloadedRepositories.map(r => r.id);
    expect(names).toContain('repo_toolforge');
    expect(names).toContain('repo_animeclash');
    expect(names).toContain('repo_infiniteempire');
  });

  it('builds a nested hierarchical tree structure from a flat file list', () => {
    const files = [
      { path: 'package.json', sizeBytes: 500 },
      { path: 'src/client/App.tsx', sizeBytes: 2500 },
      { path: 'src/server/index.ts', sizeBytes: 3000 }
    ];

    const tree = buildFileTree(files);
    expect(tree.type).toBe('directory');
    expect(tree.children?.length).toBeGreaterThan(0);

    const srcNode = tree.children?.find(c => c.name === 'src');
    expect(srcNode).toBeDefined();
    expect(srcNode?.type).toBe('directory');
    expect(srcNode?.children?.length).toBe(2);
  });

  it('accurately detects technology stack from file extensions and package.json contents', () => {
    const filePaths = ['package.json', 'src/App.tsx', 'src/server/index.ts', 'src/tests/auth.test.ts'];
    const packageJson = '{"dependencies": {"react": "19.2", "express": "4.22", "tailwindcss": "4.3"}}';

    const techStack = detectTechStack(filePaths, packageJson);
    const techNames = techStack.map(t => t.name);

    expect(techNames).toContain('TypeScript');
    expect(techNames).toContain('React 19');
    expect(techNames).toContain('Express.js');
    expect(techNames).toContain('Tailwind CSS');
    expect(techNames).toContain('Vitest');
  });

  it('extracts entrypoints, core services, database schemas, and routes', () => {
    const files = [
      { path: 'index.html' },
      { path: 'src/client/main.tsx' },
      { path: 'src/server/index.ts' },
      { path: 'src/server/database.ts' },
      { path: 'src/shared/portfoliodeploy.ts' }
    ];

    const { entrypoints, coreServices, databaseSchemas, routes } = extractArchitectureComponents(files);

    expect(entrypoints.length).toBeGreaterThanOrEqual(2);
    expect(databaseSchemas.length).toBeGreaterThanOrEqual(1);
    expect(coreServices.length).toBeGreaterThanOrEqual(1);
    expect(routes.length).toBeGreaterThanOrEqual(1);
  });

  it('generates a clean 6-step markdown setup guide with prerequisites and commands', () => {
    const guide = generateSetupGuide({
      repoName: 'TestApp',
      techStack: [{ name: 'React 19', category: 'Frontend', confidence: 100, description: '' }],
      entrypoints: [{ name: 'Main', type: 'entrypoint', filePath: 'src/main.tsx', description: '' }]
    });

    expect(guide).toContain('# Quickstart & Local Setup Guide: TestApp');
    expect(guide).toContain('npm install');
    expect(guide).toContain('npm run dev');
    expect(guide).toContain('npm test');
  });

  it('generates beginner-friendly starter issues with actionable step-by-step guidance', () => {
    const issues = generateStarterIssues([], []);
    expect(issues.length).toBeGreaterThanOrEqual(4);

    for (const issue of issues) {
      expect(issue.title.length).toBeGreaterThan(10);
      expect(issue.fileReference).toContain(':');
      expect(issue.suggestedSteps.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('runs complete end-to-end codebase analysis with security highlights', () => {
    const toolforge = preloadedRepositories[0];
    const analysis = analyzeCodebase({
      repoName: toolforge.name,
      files: toolforge.files,
      packageJsonContent: toolforge.files.find(f => f.path === 'package.json')?.contentSnippet
    });

    expect(analysis.totalFiles).toBe(toolforge.files.length);
    expect(analysis.totalBytes).toBeGreaterThan(1000);
    expect(analysis.techStack.length).toBeGreaterThan(3);
    expect(analysis.securityNotes.length).toBeGreaterThanOrEqual(3);
    expect(analysis.securityAuditPassed).toBe(true);
  });

  it('detects and blocks path traversal (Zip-Slip) attempts in file manifests', () => {
    const maliciousFiles = [
      { path: '../../etc/passwd' },
      { path: '..\\windows\\system32\\cmd.exe' },
      { path: '/absolute/root/file.txt' },
      { path: 'valid/src/index.ts' }
    ];

    const audit = validateManifestSecurity(maliciousFiles);
    expect(audit.passed).toBe(false);
    expect(audit.detectedRisks.length).toBe(3);
    expect(audit.safeFiles.length).toBe(1);
    expect(audit.safeFiles[0].path).toBe('valid/src/index.ts');
  });

  it('detects and quarantines sensitive environment files and redacts embedded secrets', () => {
    const sensitiveFiles = [
      { path: '.env', contentSnippet: 'DATABASE_URL=postgres://user:pass@localhost' },
      { path: 'server.key', contentSnippet: 'PRIVATE KEY DATA' },
      { path: 'src/config.ts', contentSnippet: 'const AWS_KEY = "AKIA0000000000000000";' },
      { path: 'src/github.ts', contentSnippet: 'const token = "ghp_000000000000000000000000000000000000";' }
    ];

    const audit = validateManifestSecurity(sensitiveFiles);
    expect(audit.passed).toBe(false);
    expect(audit.detectedRisks.length).toBeGreaterThanOrEqual(4);
    // .env and server.key are omitted from safe files
    expect(audit.safeFiles.some(f => f.path === '.env')).toBe(false);
    expect(audit.safeFiles.some(f => f.path === 'server.key')).toBe(false);

    // src/config.ts has redacted secret
    const config = audit.safeFiles.find(f => f.path === 'src/config.ts');
    expect(config?.contentSnippet).toContain('[REDACTED_AWS_KEY]');
  });

  it('parses uploaded JSON manifests, package.json files, and plain-text file lists', () => {
    // 1. JSON array of paths
    const jsonList = JSON.stringify(['src/index.ts', 'src/App.tsx', 'package.json']);
    const parsed1 = parseUploadedManifest(jsonList);
    expect(parsed1.length).toBe(3);
    expect(parsed1[0].path).toBe('src/index.ts');

    // 2. package.json object
    const pkgJson = JSON.stringify({ name: 'my-micro-app', dependencies: { react: '19.0' }, main: 'dist/index.js' });
    const parsed2 = parseUploadedManifest(pkgJson);
    expect(parsed2.some(f => f.path === 'package.json')).toBe(true);

    // 3. Newline-separated file list
    const textList = `
      src/client/main.tsx
      src/client/App.tsx
      src/server/index.ts
      # comment line
    `;
    const parsed3 = parseUploadedManifest(textList);
    expect(parsed3.length).toBe(3);
    expect(parsed3[0].path).toBe('src/client/main.tsx');
  });
});
