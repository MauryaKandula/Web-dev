export interface PersonalDetails {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolioUrl?: string;
  summary?: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  cgpaOrPercentage: string;
  graduationYear: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  duration: string;
  location: string;
  bullets: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  bullets: string[];
}

export interface SkillCategory {
  languages: string[];
  frameworks: string[];
  toolsAndCloud: string[];
  fundamentals: string[];
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
}

export interface ResumeData {
  personal: PersonalDetails;
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  skills: SkillCategory;
  certifications: CertificationItem[];
}

export interface JDAnalysisResult {
  score: number;
  extractedJDKeywords: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestedEnhancements: Array<{
    keyword: string;
    context: string;
    suggestion: string;
  }>;
}

export function validateResumeSchema(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Resume data must be a non-null object'] };
  }

  // Personal details check
  if (!data.personal || typeof data.personal !== 'object') {
    errors.push('Personal details section is required');
  } else {
    if (!data.personal.fullName || typeof data.personal.fullName !== 'string' || !data.personal.fullName.trim()) {
      errors.push('Full name is required');
    }
    if (!data.personal.email || typeof data.personal.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.personal.email.trim())) {
      errors.push('Valid email address is required');
    }
    if (!data.personal.phone || typeof data.personal.phone !== 'string' || !data.personal.phone.trim()) {
      errors.push('Contact phone number is required');
    }
  }

  // Education check
  if (!Array.isArray(data.education) || data.education.length === 0) {
    errors.push('At least one education entry is required');
  } else {
    data.education.forEach((edu: any, idx: number) => {
      if (!edu.institution || !edu.degree || !edu.graduationYear) {
        errors.push(`Education entry #${idx + 1} is missing institution, degree, or graduation year`);
      }
    });
  }

  // Skills check
  if (!data.skills || typeof data.skills !== 'object') {
    errors.push('Skills section is required');
  } else {
    if (!Array.isArray(data.skills.languages) || data.skills.languages.length === 0) {
      errors.push('At least one programming language is required in skills');
    }
  }

  // Projects check
  if (!Array.isArray(data.projects) || data.projects.length === 0) {
    errors.push('At least one technical project is required');
  } else {
    data.projects.forEach((proj: any, idx: number) => {
      if (!proj.title || !Array.isArray(proj.techStack) || proj.techStack.length === 0) {
        errors.push(`Project #${idx + 1} is missing title or tech stack tags`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Common tech keywords dictionary for Indian CSE placement drives
const TECH_KEYWORDS_DICTIONARY = [
  'python', 'java', 'c++', 'c', 'javascript', 'typescript', 'go', 'golang', 'rust',
  'react', 'next.js', 'vue', 'angular', 'node.js', 'express', 'fastapi', 'django', 'spring boot',
  'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'sqlite', 'elasticsearch',
  'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'git', 'github', 'ci/cd', 'linux',
  'data structures', 'algorithms', 'dsa', 'oops', 'dbms', 'operating systems', 'computer networks',
  'system design', 'rest api', 'graphql', 'microservices', 'kafka', 'rabbitmq',
  'machine learning', 'nlp', 'pytorch', 'tensorflow', 'scikit-learn', 'opencv',
  'html', 'css', 'tailwind', 'bootstrap', 'jest', 'vitest', 'postman'
];

const CANONICAL_ALIASES: Record<string, string[]> = {
  'go': ['golang'],
  'golang': ['go'],
  'javascript': ['js'],
  'js': ['javascript'],
  'typescript': ['ts'],
  'ts': ['typescript'],
  'python': ['py'],
  'py': ['python'],
  'postgresql': ['postgres', 'pgsql'],
  'postgres': ['postgresql', 'pgsql'],
  'node.js': ['nodejs', 'node'],
  'nodejs': ['node.js', 'node'],
  'c++': ['cpp'],
  'cpp': ['c++'],
  'kubernetes': ['k8s'],
  'k8s': ['kubernetes'],
  'mongodb': ['mongo'],
  'mongo': ['mongodb'],
  'react': ['reactjs', 'react.js'],
  'reactjs': ['react'],
  'vue': ['vuejs', 'vue.js'],
  'vuejs': ['vue'],
  'ci/cd': ['cicd'],
  'rest api': ['rest apis', 'restful api', 'restful apis', 'restful', 'rest'],
  'dsa': ['data structures', 'algorithms']
};

function testKeywordInText(text: string, kw: string): boolean {
  const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(^|[^a-zA-Z0-9_#+])${escaped}([^a-zA-Z0-9_#+]|$)`, 'i');
  if (regex.test(text)) return true;

  const aliases = CANONICAL_ALIASES[kw] || [];
  for (const alias of aliases) {
    const aliasEscaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const aliasRegex = new RegExp(`(^|[^a-zA-Z0-9_#+])${aliasEscaped}([^a-zA-Z0-9_#+]|$)`, 'i');
    if (aliasRegex.test(text)) return true;
  }
  return false;
}

export function analyzeJobDescription(resume: ResumeData, jdText: string): JDAnalysisResult {
  if (!jdText || typeof jdText !== 'string' || !jdText.trim()) {
    return {
      score: 0,
      extractedJDKeywords: [],
      matchedKeywords: [],
      missingKeywords: [],
      suggestedEnhancements: []
    };
  }

  const jdLower = jdText.toLowerCase();

  // Extract relevant tech keywords present in the JD
  const extractedJDKeywords = TECH_KEYWORDS_DICTIONARY.filter(kw => {
    // Regex boundary check for words, handling c++, c#, node.js, etc.
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-zA-Z0-9_#+])${escaped}([^a-zA-Z0-9_#+]|$)`, 'i');
    return regex.test(jdLower);
  });

  if (extractedJDKeywords.length === 0) {
    // Fallback: tokenize words with length >= 4
    const tokens = jdLower.match(/[a-z]{4,}/g) || [];
    const uniqueTokens = Array.from(new Set(tokens)).slice(0, 15);
    return {
      score: 50,
      extractedJDKeywords: uniqueTokens,
      matchedKeywords: [],
      missingKeywords: uniqueTokens,
      suggestedEnhancements: [{
        keyword: 'General Keyword Match',
        context: 'Job description contains non-standard keywords',
        suggestion: 'Ensure your project bullets explicitly mention relevant algorithms, databases, and frameworks.'
      }]
    };
  }

  // Gather all resume keywords
  const resumeKeywordsSet = new Set<string>();

  // Add skills
  if (resume.skills) {
    (resume.skills.languages || []).forEach(k => resumeKeywordsSet.add(k.toLowerCase().trim()));
    (resume.skills.frameworks || []).forEach(k => resumeKeywordsSet.add(k.toLowerCase().trim()));
    (resume.skills.toolsAndCloud || []).forEach(k => resumeKeywordsSet.add(k.toLowerCase().trim()));
    (resume.skills.fundamentals || []).forEach(k => resumeKeywordsSet.add(k.toLowerCase().trim()));
  }

  // Add project tech stacks and text
  const projectText = (resume.projects || []).map(p => {
    (p.techStack || []).forEach(t => resumeKeywordsSet.add(t.toLowerCase().trim()));
    return `${p.title} ${(p.bullets || []).join(' ')}`;
  }).join(' ').toLowerCase();

  // Add experience text
  const experienceText = (resume.experience || []).map(e => {
    return `${e.company} ${e.role} ${(e.bullets || []).join(' ')}`;
  }).join(' ').toLowerCase();

  const fullResumeBlob = `${resume.personal.summary || ''} ${projectText} ${experienceText}`.toLowerCase();

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];
  const suggestedEnhancements: Array<{ keyword: string; context: string; suggestion: string }> = [];

  for (const kw of extractedJDKeywords) {
    const inSkills = Array.from(resumeKeywordsSet).some(skill => testKeywordInText(skill, kw));
    const inBlob = testKeywordInText(fullResumeBlob, kw);

    if (inSkills || inBlob) {
      matchedKeywords.push(kw);
      if (inSkills && !inBlob) {
        suggestedEnhancements.push({
          keyword: kw,
          context: `You listed "${kw}" in your skills section but did not detail it in your project or experience bullet points.`,
          suggestion: `Add a bullet under your primary project explaining how you applied ${kw} (e.g., "Engineered ${kw} pipeline resulting in 40% lower response latency").`
        });
      }
    } else {
      missingKeywords.push(kw);
      suggestedEnhancements.push({
        keyword: kw,
        context: `Recruiter JD heavily emphasizes "${kw}".`,
        suggestion: `If you have worked with ${kw} in coursework, labs, or hackathons, add it under your Technical Skills and describe the practical context in your projects.`
      });
    }
  }

  const score = Math.round((matchedKeywords.length / extractedJDKeywords.length) * 100);

  return {
    score: Math.min(100, Math.max(0, score)),
    extractedJDKeywords,
    matchedKeywords,
    missingKeywords,
    suggestedEnhancements: suggestedEnhancements.slice(0, 5)
  };
}

export const samplePlacementResume: ResumeData = {
  personal: {
    fullName: 'Example Candidate',
    email: 'candidate@placementforge.test',
    phone: '0000000000',
    location: 'Example City',
    linkedin: '',
    github: '',
    portfolioUrl: '',
    summary: 'Example profile for the local preview. Replace sample content with accurate details before using this resume.'
  },
  education: [
    {
      id: 'edu_1',
      institution: 'Example University',
      degree: 'Example degree',
      fieldOfStudy: 'Example field of study',
      cgpaOrPercentage: 'Add an accurate result',
      graduationYear: 'YYYY'
    },
    {
      id: 'edu_2',
      institution: 'Example School',
      degree: 'Example qualification',
      fieldOfStudy: 'Example subjects',
      cgpaOrPercentage: 'Add an accurate result',
      graduationYear: 'YYYY'
    }
  ],
  experience: [
    {
      id: 'exp_1',
      company: 'Example Organization',
      role: 'Example Role',
      duration: 'Example dates',
      location: 'Example Location',
      bullets: [
        'Describe a real feature you delivered and the technologies you used.',
        'Describe an outcome you can support with accurate evidence.',
        'Replace this sample bullet with a truthful result from your experience.'
      ]
    }
  ],
  projects: [
    {
      id: 'proj_1',
      title: 'Example Project One',
      techStack: ['Go', 'Redis', 'Docker', 'gRPC', 'PostgreSQL'],
      liveUrl: '',
      githubUrl: '',
      bullets: [
        'Describe the project goal and your contribution.',
        'List the main technologies you used and why.',
        'Add a measured outcome only when you can substantiate it.'
      ]
    },
    {
      id: 'proj_2',
      title: 'Example Project Two',
      techStack: ['TypeScript', 'React', 'Node.js', 'Express', 'Tailwind CSS'],
      liveUrl: '',
      githubUrl: '',
      bullets: [
        'Describe the user problem and what the project does.',
        'Explain one technical decision that you made.',
        'Add a real link and an evidence-based outcome when available.'
      ]
    }
  ],
  skills: {
    languages: ['C++', 'Go', 'Python', 'TypeScript', 'Java', 'SQL'],
    frameworks: ['Node.js', 'Express', 'React', 'Next.js', 'FastAPI', 'Tailwind CSS'],
    toolsAndCloud: ['Docker', 'Kubernetes', 'Git', 'Linux', 'Redis', 'PostgreSQL', 'AWS EC2/S3'],
    fundamentals: ['Data Structures & Algorithms', 'Operating Systems', 'DBMS', 'Computer Networks', 'System Design']
  },
  certifications: []
};
