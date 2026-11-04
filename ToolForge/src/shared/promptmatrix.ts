/**
 * PromptMatrix (P-11) — LLM System Prompt Engineering, Evals & Few-Shot Studio
 * 
 * Provides prompt templating, token estimation, multi-model cost calculation,
 * test matrix evaluation, and SDK code generation for modern AI developers.
 */

export interface PromptVariable {
  name: string;
  defaultValue: string;
  description: string;
}

export interface FewShotExample {
  id: string;
  input: string;
  output: string;
  explanation?: string;
}

export interface TestCase {
  id: string;
  variables: Record<string, string>;
  expectedKeywords: string[];
  notes?: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  category: 'coding' | 'agent' | 'extraction' | 'creative' | 'rag';
  systemPrompt: string;
  userPromptTemplate: string;
  variables: PromptVariable[];
  fewShotExamples: FewShotExample[];
  testCases: TestCase[];
  modelRecommendation: string;
}

export interface ModelPricing {
  modelId: string;
  name: string;
  provider: 'Google' | 'OpenAI' | 'Anthropic' | 'Ollama';
  inputCostPerMillionUsd: number;
  outputCostPerMillionUsd: number;
  contextWindowTokens: number;
}

export const SUPPORTED_MODELS: ModelPricing[] = [
  {
    modelId: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    inputCostPerMillionUsd: 0.10,
    outputCostPerMillionUsd: 0.40,
    contextWindowTokens: 1048576,
  },
  {
    modelId: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    inputCostPerMillionUsd: 3.00,
    outputCostPerMillionUsd: 15.00,
    contextWindowTokens: 200000,
  },
  {
    modelId: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    inputCostPerMillionUsd: 0.15,
    outputCostPerMillionUsd: 0.60,
    contextWindowTokens: 128000,
  },
  {
    modelId: 'ollama-qwen3.5-4b',
    name: 'Ollama Qwen 3.5 4B (Local)',
    provider: 'Ollama',
    inputCostPerMillionUsd: 0.00,
    outputCostPerMillionUsd: 0.00,
    contextWindowTokens: 32768,
  },
];

export const STARTER_PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'tpl_code_refactor',
    title: 'Zero-Defect Code Refactoring & Security Auditor',
    category: 'coding',
    systemPrompt: `You are an elite Senior Principal Software Architect.
Your task is to refactor the provided code to be production-grade, highly performant, and secure.
Rules:
1. Preserve 100% of the public API and business invariants unless explicitly asked to modify.
2. Eliminate all security vulnerabilities (OWASP top 10, injection, memory leaks, unhandled exceptions).
3. Provide algorithmic time/space complexity analysis before and after the refactor.
4. Output clean, self-contained code accompanied by unit test suites.`,
    userPromptTemplate: `Language: {{language}}
Framework: {{framework}}

Original Code:
\`\`\`{{language}}
{{code}}
\`\`\`

Refactoring Goal:
{{goal}}`,
    variables: [
      { name: 'language', defaultValue: 'typescript', description: 'Programming language' },
      { name: 'framework', defaultValue: 'React 19 / Express', description: 'Runtime framework' },
      { name: 'code', defaultValue: 'function processData(items) { let res = []; for(let i=0; i<items.length; i++) { res.push(items[i].value * 2); } return res; }', description: 'Target code' },
      { name: 'goal', defaultValue: 'Vectorize or functionalize, add type-safety and null-guard bounds.', description: 'Refactoring objective' },
    ],
    fewShotExamples: [
      {
        id: 'ex_1',
        input: 'Language: JavaScript\nOriginal: for(var i=0; i<arr.length; i++) { if(arr[i] > 10) out.push(arr[i]); }',
        output: 'Refactored:\nexport const filterGreaterThanTen = <T extends number>(arr: readonly T[]): T[] =>\n  arr.filter((x): x is T => x > 10);',
        explanation: 'Converted imperative loop to immutable functional filter with generic TypeScript guard.',
      },
    ],
    testCases: [
      {
        id: 'tc_1',
        variables: {
          language: 'python',
          framework: 'FastAPI',
          code: 'def get_user(id):\n    return db.query(f"SELECT * FROM users WHERE id = {id}")',
          goal: 'Fix SQL injection vulnerability with parameterized ORM query.',
        },
        expectedKeywords: ['parameterized', 'SQL injection', 'CVE', 'query'],
        notes: 'Verifies detection of SQL injection flaw.',
      },
    ],
    modelRecommendation: 'gemini-2.0-flash',
  },
  {
    id: 'tpl_structured_extractor',
    title: 'High-Fidelity Structured Entity & JSON Extractor',
    category: 'extraction',
    systemPrompt: `You are an uncompromising data extraction pipeline engine.
Extract all structured entities matching the requested JSON schema from unstructured input.
Respond strictly with valid JSON. Never include markdown conversational filler.`,
    userPromptTemplate: `Schema:
\`\`\`json
{{schema}}
\`\`\`

Unstructured Document:
"""
{{document}}
"""`,
    variables: [
      { name: 'schema', defaultValue: '{"candidate": "string", "skills": ["string"], "cgpa": "number"}', description: 'Target JSON Schema' },
      { name: 'document', defaultValue: 'Candidate Arjun graduated in CSE with an 8.9 CGPA. Proficient in React, Node, and Python.', description: 'Raw document text' },
    ],
    fewShotExamples: [
      {
        id: 'ex_json_1',
        input: 'Extract candidate name from: "Hi I am Priya, email priya@test.com"',
        output: '{"name": "Priya", "email": "priya@test.com"}',
      },
    ],
    testCases: [],
    modelRecommendation: 'gpt-4o-mini',
  },
];

/**
 * Estimate token count using the industry standard heuristic (1 token ~ 4 characters).
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.trim().length / 4);
}

/**
 * Render prompt template by interpolating {{variable}} tokens.
 */
export function renderPrompt(template: string, variables: Record<string, string>): string {
  let rendered = template;
  for (const [key, value] of Object.entries(variables)) {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    rendered = rendered.replace(pattern, value ?? '');
  }
  return rendered;
}

/**
 * Calculate estimated inference cost for a prompt.
 */
export function calculateInferenceCost(
  inputTokens: number,
  estimatedOutputTokens: number,
  model: ModelPricing
): { inputCostUsd: number; outputCostUsd: number; totalCostUsd: number } {
  const inputCostUsd = (inputTokens / 1_000_000) * model.inputCostPerMillionUsd;
  const outputCostUsd = (estimatedOutputTokens / 1_000_000) * model.outputCostPerMillionUsd;
  return {
    inputCostUsd: Number(inputCostUsd.toFixed(6)),
    outputCostUsd: Number(outputCostUsd.toFixed(6)),
    totalCostUsd: Number((inputCostUsd + outputCostUsd).toFixed(6)),
  };
}

/**
 * Evaluate prompt response against required keywords.
 */
export function evaluateKeywords(
  response: string,
  expectedKeywords: string[]
): { passed: boolean; matchScore: number; missingKeywords: string[] } {
  if (!expectedKeywords.length) {
    return { passed: true, matchScore: 100, missingKeywords: [] };
  }
  const lower = response.toLowerCase();
  const matched = expectedKeywords.filter((k) => lower.includes(k.toLowerCase()));
  const missing = expectedKeywords.filter((k) => !lower.includes(k.toLowerCase()));
  const matchScore = Math.round((matched.length / expectedKeywords.length) * 100);

  return {
    passed: missing.length === 0,
    matchScore,
    missingKeywords: missing,
  };
}

/**
 * Generate ready-to-run Python code for calling the prompt with official Google GenAI / OpenAI SDKs.
 */
export function generateSdkCodeSnippet(
  template: PromptTemplate,
  variables: Record<string, string>,
  provider: 'google' | 'openai'
): string {
  const userContent = renderPrompt(template.userPromptTemplate, variables);

  if (provider === 'google') {
    return `# Google Gemini SDK (google-genai)
from google import genai

client = genai.Client()

system_instruction = """${template.systemPrompt}"""

response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents="""${userContent}""",
    config=genai.types.GenerateContentConfig(
        system_instruction=system_instruction,
        temperature=0.2,
    )
)

print(response.text)
`;
  }

  return `# OpenAI SDK
from openai import OpenAI

client = OpenAI()

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": """${template.systemPrompt}"""},
        {"role": "user", "content": """${userContent}"""}
    ],
    temperature=0.2,
)

print(response.choices[0].message.content)
`;
}
