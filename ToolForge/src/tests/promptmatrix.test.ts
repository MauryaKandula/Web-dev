import { describe, it, expect } from 'vitest';
import {
  estimateTokens,
  renderPrompt,
  calculateInferenceCost,
  evaluateKeywords,
  generateSdkCodeSnippet,
  SUPPORTED_MODELS,
  STARTER_PROMPT_TEMPLATES,
} from '../shared/promptmatrix.ts';

describe('PromptMatrix Engine Tests', () => {
  it('estimates token count accurately from text length', () => {
    expect(estimateTokens('')).toBe(0);
    expect(estimateTokens('hello world')).toBe(3); // 11 chars / 4 ~ 3
    expect(estimateTokens('a'.repeat(400))).toBe(100);
  });

  it('renders variables into user prompt templates cleanly', () => {
    const tpl = 'Hello {{name}}, welcome to {{project}}!';
    const rendered = renderPrompt(tpl, { name: 'Example Developer', project: 'ToolForge' });
    expect(rendered).toBe('Hello Example Developer, welcome to ToolForge!');
  });

  it('calculates inference costs for different LLM providers accurately', () => {
    const gemini = SUPPORTED_MODELS.find((m) => m.modelId === 'gemini-2.0-flash')!;
    const costs = calculateInferenceCost(10000, 2000, gemini);
    // 10,000 / 1M * 0.10 = $0.001
    // 2,000 / 1M * 0.40 = $0.0008
    expect(costs.inputCostUsd).toBeCloseTo(0.001, 4);
    expect(costs.outputCostUsd).toBeCloseTo(0.0008, 4);
    expect(costs.totalCostUsd).toBeCloseTo(0.0018, 4);

    const ollama = SUPPORTED_MODELS.find((m) => m.provider === 'Ollama')!;
    const ollamaCosts = calculateInferenceCost(100000, 50000, ollama);
    expect(ollamaCosts.totalCostUsd).toBe(0);
  });

  it('evaluates keyword matches in model responses', () => {
    const response = 'We refactored the function using parameterized queries to prevent SQL injection vulnerabilities.';
    const evalResult = evaluateKeywords(response, ['parameterized', 'SQL injection', 'CVE']);
    expect(evalResult.passed).toBe(false);
    expect(evalResult.missingKeywords).toEqual(['CVE']);
    expect(evalResult.matchScore).toBe(67);

    const perfectEval = evaluateKeywords(response, ['parameterized', 'sql injection']);
    expect(perfectEval.passed).toBe(true);
    expect(perfectEval.missingKeywords).toEqual([]);
    expect(perfectEval.matchScore).toBe(100);
  });

  it('generates valid Python SDK code snippets for Google and OpenAI', () => {
    const tpl = STARTER_PROMPT_TEMPLATES[0];
    const vars = { language: 'python', framework: 'FastAPI', code: 'pass', goal: 'refactor' };

    const googleCode = generateSdkCodeSnippet(tpl, vars, 'google');
    expect(googleCode).toContain('from google import genai');
    expect(googleCode).toContain('gemini-2.0-flash');
    expect(googleCode).toContain('Language: python');

    const openaiCode = generateSdkCodeSnippet(tpl, vars, 'openai');
    expect(openaiCode).toContain('from openai import OpenAI');
    expect(openaiCode).toContain('gpt-4o-mini');
  });
});
