import { describe, it, expect } from 'vitest';
import {
  validateResumeSchema,
  analyzeJobDescription,
  samplePlacementResume,
  ResumeData
} from '../shared/placementforge.ts';

describe('Product 01: PlacementForge Resume & JD Analyzer Engine', () => {
  describe('Resume Schema Validation', () => {
    it('validates the complete local example resume', () => {
      const result = validateResumeSchema(samplePlacementResume);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects null, non-object, or empty input', () => {
      expect(validateResumeSchema(null).valid).toBe(false);
      expect(validateResumeSchema(undefined).valid).toBe(false);
      expect(validateResumeSchema('string').valid).toBe(false);
    });

    it('flags missing personal information (full name, email, phone)', () => {
      const invalidData = {
        personal: {
          fullName: '',
          email: 'invalid-email',
          phone: '',
          location: ''
        },
        education: samplePlacementResume.education,
        skills: samplePlacementResume.skills,
        projects: samplePlacementResume.projects,
        experience: [],
        certifications: []
      };

      const result = validateResumeSchema(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Full name'))).toBe(true);
      expect(result.errors.some(e => e.includes('email'))).toBe(true);
      expect(result.errors.some(e => e.includes('phone'))).toBe(true);
    });

    it('requires at least one education entry with institution and degree', () => {
      const noEdu: ResumeData = {
        ...samplePlacementResume,
        education: []
      };
      const result = validateResumeSchema(noEdu);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('education entry is required'))).toBe(true);
    });

    it('requires programming languages under skills', () => {
      const noSkills: ResumeData = {
        ...samplePlacementResume,
        skills: {
          languages: [],
          frameworks: ['React'],
          toolsAndCloud: ['Docker'],
          fundamentals: ['DSA']
        }
      };
      const result = validateResumeSchema(noSkills);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('programming language is required'))).toBe(true);
    });

    it('requires at least one technical project with title and tech stack', () => {
      const noProj: ResumeData = {
        ...samplePlacementResume,
        projects: []
      };
      const result = validateResumeSchema(noProj);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('technical project is required'))).toBe(true);
    });
  });

  describe('Job Description (JD) Keyword Matching & Scoring Algorithm', () => {
    it('returns score 0 and empty arrays when JD is empty or whitespace', () => {
      const result = analyzeJobDescription(samplePlacementResume, '   ');
      expect(result.score).toBe(0);
      expect(result.matchedKeywords).toHaveLength(0);
      expect(result.missingKeywords).toHaveLength(0);
      expect(result.suggestedEnhancements).toHaveLength(0);
    });

    it('computes high match score when candidate skills align with JD requirements', () => {
      const targetJD = `
        We are seeking a Backend SDE Intern with experience in Go, Redis, Docker, and PostgreSQL.
        Knowledge of REST API development, Linux, and Data Structures is required.
      `;

      const result = analyzeJobDescription(samplePlacementResume, targetJD);

      expect(result.score).toBeGreaterThanOrEqual(75);
      expect(result.extractedJDKeywords).toEqual(
        expect.arrayContaining(['go', 'redis', 'docker', 'postgresql', 'rest api', 'linux', 'data structures'])
      );
      expect(result.matchedKeywords).toContain('go');
      expect(result.matchedKeywords).toContain('redis');
      expect(result.matchedKeywords).toContain('docker');
      expect(result.matchedKeywords).toContain('postgresql');
    });

    it('correctly handles special technology tokens like c++, node.js, and ci/cd', () => {
      const specializedJD = `
        Candidate should know C++, Node.js, and CI/CD pipelines.
      `;

      const result = analyzeJobDescription(samplePlacementResume, specializedJD);
      expect(result.extractedJDKeywords).toContain('c++');
      expect(result.extractedJDKeywords).toContain('node.js');
      expect(result.extractedJDKeywords).toContain('ci/cd');
      expect(result.matchedKeywords).toContain('c++');
      expect(result.matchedKeywords).toContain('node.js');
    });

    it('identifies missing recruiter keywords not present in resume', () => {
      const aiMlJD = `
        Looking for an AI engineer with expertise in PyTorch, TensorFlow, NLP, and OpenCV.
      `;

      const result = analyzeJobDescription(samplePlacementResume, aiMlJD);

      // Candidate has backend/systems profile, so AI/ML keywords should be missing
      expect(result.missingKeywords).toContain('pytorch');
      expect(result.missingKeywords).toContain('tensorflow');
      expect(result.missingKeywords).toContain('nlp');
      expect(result.missingKeywords).toContain('opencv');
      expect(result.score).toBeLessThanOrEqual(40);
    });

    it('generates truthful bullet enhancement suggestions for skills listed but omitted from project details', () => {
      const jd = `
        Requires strong knowledge of Java, SQL, and Docker.
      `;

      const result = analyzeJobDescription(samplePlacementResume, jd);

      // The sample candidate has Java in skills, but Java is not in the project titles or bullets (Go/TypeScript are).
      const javaEnhancement = result.suggestedEnhancements.find(e => e.keyword === 'java');
      if (javaEnhancement) {
        expect(javaEnhancement.context).toContain('skills section but did not detail it');
        expect(javaEnhancement.suggestion).toContain('project');
      }
      expect(result.suggestedEnhancements.length).toBeGreaterThan(0);
    });

    it('ensures match score is always bounded strictly between 0 and 100', () => {
      const emptyMatch = analyzeJobDescription(samplePlacementResume, 'NonexistentFramework123456');
      expect(emptyMatch.score).toBeGreaterThanOrEqual(0);
      expect(emptyMatch.score).toBeLessThanOrEqual(100);

      const fullMatch = analyzeJobDescription(samplePlacementResume, 'Python, Go, C++, SQL, Docker, Redis, React');
      expect(fullMatch.score).toBeGreaterThanOrEqual(0);
      expect(fullMatch.score).toBeLessThanOrEqual(100);
    });

    it('strictly prevents false-positive substring matches (JS does not match Java, CSS/React does not match C, robust does not match Rust)', () => {
      const resumeOnlyJS: ResumeData = {
        personal: {
          fullName: 'Ananya Rao',
          email: 'ananya@example.com',
          phone: '+91 99999 88888',
          location: 'Hyderabad, India',
          summary: 'Created robust web applications using frontend frameworks.'
        },
        education: [
          {
            id: 'edu_1',
            institution: 'IIT Hyderabad',
            degree: 'B.Tech',
            fieldOfStudy: 'CSE',
            cgpaOrPercentage: '9.0',
            graduationYear: '2026'
          }
        ],
        experience: [],
        projects: [
          {
            id: 'proj_1',
            title: 'Design System Library',
            techStack: ['JavaScript', 'HTML', 'CSS', 'Tailwind'],
            bullets: ['Organized UI components and created interactive responsive layouts.']
          }
        ],
        skills: {
          languages: ['JavaScript', 'HTML', 'CSS'],
          frameworks: ['React', 'Tailwind'],
          toolsAndCloud: [],
          fundamentals: []
        },
        certifications: []
      };

      // Recruiter explicitly asks for Java, C, Rust, and Go
      const jd = 'Seeking software developer with core skills in Java, C, Rust, and Go.';
      const result = analyzeJobDescription(resumeOnlyJS, jd);

      // Must NOT match Java because of JavaScript
      expect(result.matchedKeywords).not.toContain('java');
      expect(result.missingKeywords).toContain('java');

      // Must NOT match C because of CSS, React, or "created"
      expect(result.matchedKeywords).not.toContain('c');
      expect(result.missingKeywords).toContain('c');

      // Must NOT match Rust because of "robust"
      expect(result.matchedKeywords).not.toContain('rust');
      expect(result.missingKeywords).toContain('rust');

      // Must NOT match Go because of "organized"
      expect(result.matchedKeywords).not.toContain('go');
      expect(result.missingKeywords).toContain('go');

      expect(result.score).toBe(0);
    });

    it('accurately resolves canonical tech aliases (Golang -> Go, K8s -> Kubernetes, Postgres -> PostgreSQL)', () => {
      const aliasResume: ResumeData = {
        ...samplePlacementResume,
        skills: {
          languages: ['Golang', 'TS', 'Python'],
          frameworks: ['Nodejs', 'ReactJS'],
          toolsAndCloud: ['K8s', 'Postgres'],
          fundamentals: ['DSA']
        }
      };

      const jd = 'Looking for Go, Kubernetes, PostgreSQL, TypeScript, and Node.js skills.';
      const result = analyzeJobDescription(aliasResume, jd);

      expect(result.matchedKeywords).toContain('go');
      expect(result.matchedKeywords).toContain('kubernetes');
      expect(result.matchedKeywords).toContain('postgresql');
      expect(result.matchedKeywords).toContain('typescript');
      expect(result.matchedKeywords).toContain('node.js');
      expect(result.score).toBe(100);
    });
  });

  describe('Strict Resume Schema Validation Boundaries', () => {
    it('rejects phone numbers that consist only of whitespace', () => {
      const whitespacePhone = {
        ...samplePlacementResume,
        personal: { ...samplePlacementResume.personal, phone: '   ' }
      };
      const res = validateResumeSchema(whitespacePhone);
      expect(res.valid).toBe(false);
      expect(res.errors.some(e => e.includes('Contact phone number'))).toBe(true);
    });

    it('rejects malformed email addresses missing top-level domain or local part', () => {
      const badEmail1 = {
        ...samplePlacementResume,
        personal: { ...samplePlacementResume.personal, email: 'student@' }
      };
      expect(validateResumeSchema(badEmail1).valid).toBe(false);

      const badEmail2 = {
        ...samplePlacementResume,
        personal: { ...samplePlacementResume.personal, email: 'student@nodomain' }
      };
      expect(validateResumeSchema(badEmail2).valid).toBe(false);
    });
  });
});
