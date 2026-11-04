import { describe, it, expect } from 'vitest';
import {
  dsaProblems,
  deepEqual,
  runSandboxedCode,
  calculateReadinessScore,
  ProblemProgress
} from '../shared/interviewlab.ts';

describe('InterviewLab (Product 02 • Wave B)', () => {
  it('curates exactly 8 high-frequency Indian campus placement DSA problems', () => {
    expect(dsaProblems.length).toBe(8);

    const problemIds = dsaProblems.map(p => p.id);
    expect(problemIds).toContain('two-sum');
    expect(problemIds).toContain('container-with-most-water');
    expect(problemIds).toContain('longest-substring-without-repeating');
    expect(problemIds).toContain('search-in-rotated-sorted-array');
    expect(problemIds).toContain('maximum-subarray');
    expect(problemIds).toContain('coin-change');
    expect(problemIds).toContain('lowest-common-ancestor');
    expect(problemIds).toContain('trapping-rain-water');
  });

  it('guarantees complete problem schema, complexity targets, and hints', () => {
    for (const prob of dsaProblems) {
      expect(prob.targetTimeComplexity).toMatch(/^O\(/);
      expect(prob.targetSpaceComplexity).toMatch(/^O\(/);
      expect(prob.companies.length).toBeGreaterThan(0);
      expect(prob.hints.length).toBeGreaterThanOrEqual(3);
      expect(prob.testCases.length).toBeGreaterThanOrEqual(2);
      expect(prob.starterCode).toContain(prob.functionName);
      expect(prob.solutionCode).toContain(prob.functionName);
    }
  });

  it('accurately evaluates deep equality across primitives, arrays, and objects', () => {
    expect(deepEqual(42, 42)).toBe(true);
    expect(deepEqual('hello', 'hello')).toBe(true);
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(deepEqual([1, 2], [2, 1])).toBe(false);
    expect(deepEqual({ a: 1, b: [2, 3] }, { a: 1, b: [2, 3] })).toBe(true);
    expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
  });

  // Verify reference solutions for each of the 8 problems in the sandbox
  it('executes Two Sum solution in sandbox and passes all test cases', () => {
    const p = dsaProblems.find(x => x.id === 'two-sum')!;
    const res = runSandboxedCode(p.solutionCode, p.functionName, p.testCases);
    expect(res.allPassed).toBe(true);
    expect(res.passedCount).toBe(p.testCases.length);
  });

  it('executes Container With Most Water solution in sandbox and passes', () => {
    const p = dsaProblems.find(x => x.id === 'container-with-most-water')!;
    const res = runSandboxedCode(p.solutionCode, p.functionName, p.testCases);
    expect(res.allPassed).toBe(true);
    expect(res.passedCount).toBe(p.testCases.length);
  });

  it('executes Longest Substring Without Repeating Characters in sandbox and passes', () => {
    const p = dsaProblems.find(x => x.id === 'longest-substring-without-repeating')!;
    const res = runSandboxedCode(p.solutionCode, p.functionName, p.testCases);
    expect(res.allPassed).toBe(true);
    expect(res.passedCount).toBe(p.testCases.length);
  });

  it('executes Search in Rotated Sorted Array in sandbox and passes', () => {
    const p = dsaProblems.find(x => x.id === 'search-in-rotated-sorted-array')!;
    const res = runSandboxedCode(p.solutionCode, p.functionName, p.testCases);
    expect(res.allPassed).toBe(true);
    expect(res.passedCount).toBe(p.testCases.length);
  });

  it('executes Maximum Subarray (Kadane’s) in sandbox and passes', () => {
    const p = dsaProblems.find(x => x.id === 'maximum-subarray')!;
    const res = runSandboxedCode(p.solutionCode, p.functionName, p.testCases);
    expect(res.allPassed).toBe(true);
    expect(res.passedCount).toBe(p.testCases.length);
  });

  it('executes Coin Change in sandbox and passes', () => {
    const p = dsaProblems.find(x => x.id === 'coin-change')!;
    const res = runSandboxedCode(p.solutionCode, p.functionName, p.testCases);
    expect(res.allPassed).toBe(true);
    expect(res.passedCount).toBe(p.testCases.length);
  });

  it('executes Lowest Common Ancestor in sandbox and passes', () => {
    const p = dsaProblems.find(x => x.id === 'lowest-common-ancestor')!;
    const res = runSandboxedCode(p.solutionCode, p.functionName, p.testCases);
    expect(res.allPassed).toBe(true);
    expect(res.passedCount).toBe(p.testCases.length);
  });

  it('executes Trapping Rain Water in sandbox and passes', () => {
    const p = dsaProblems.find(x => x.id === 'trapping-rain-water')!;
    const res = runSandboxedCode(p.solutionCode, p.functionName, p.testCases);
    expect(res.allPassed).toBe(true);
    expect(res.passedCount).toBe(p.testCases.length);
  });

  it('safely catches syntax and evaluation errors without crashing the runner', () => {
    const brokenCode = `function twoSum(nums, target) { return invalidSyntax ;;;; }}}`;
    const p = dsaProblems[0];
    const res = runSandboxedCode(brokenCode, p.functionName, p.testCases);

    expect(res.allPassed).toBe(false);
    expect(res.compilationError).toBeDefined();
    expect(res.results.length).toBe(0);
  });

  it('captures expected versus actual on incorrect outputs', () => {
    const wrongCode = `function twoSum(nums, target) { return [999, 888]; }`;
    const p = dsaProblems[0];
    const res = runSandboxedCode(wrongCode, p.functionName, p.testCases);

    expect(res.allPassed).toBe(false);
    expect(res.passedCount).toBe(0);
    expect(res.results[0].passed).toBe(false);
    expect(res.results[0].actual).toEqual([999, 888]);
  });

  it('computes placement readiness score accurately according to difficulty weighting', () => {
    const emptyProgress: ProblemProgress[] = [];
    expect(calculateReadinessScore(emptyProgress)).toBe(0);

    const fullMastery: ProblemProgress[] = dsaProblems.map(p => ({
      problemId: p.id,
      status: 'mastered',
      reviewIntervalDays: 7,
      attemptsCount: 2
    }));
    expect(calculateReadinessScore(fullMastery)).toBe(100);

    const halfMastery: ProblemProgress[] = dsaProblems.map(p => ({
      problemId: p.id,
      status: 'practicing',
      reviewIntervalDays: 1,
      attemptsCount: 1
    }));
    expect(calculateReadinessScore(halfMastery)).toBe(50);
  });

  it('accepts Two Sum solutions returning indices in reverse order', () => {
    // Problem explicitly states: "You can return the answer in any order."
    const reverseOrderCode = `function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) {
          return [i, map.get(comp)]; // Reversed order [1, 0] instead of [0, 1]
        }
        map.set(nums[i], i);
      }
      return [];
    }`;

    const p = dsaProblems.find(x => x.id === 'two-sum')!;
    const res = runSandboxedCode(reverseOrderCode, p.functionName, p.testCases);
    expect(res.allPassed).toBe(true);
    expect(res.passedCount).toBe(p.testCases.length);
  });

  it('isolates sandboxed execution by shadowing dangerous browser and environment globals', () => {
    const maliciousAttemptCode = `function twoSum(nums, target) {
      if (typeof window !== 'undefined' && window !== null) {
        throw new Error('Exploit: window was accessible');
      }
      if (typeof document !== 'undefined' && document !== null) {
        throw new Error('Exploit: document was accessible');
      }
      if (typeof localStorage !== 'undefined' && localStorage !== null) {
        throw new Error('Exploit: localStorage was accessible');
      }
      return [0, 1];
    }`;

    const p = dsaProblems[0];
    const res = runSandboxedCode(maliciousAttemptCode, p.functionName, [p.testCases[0]]);
    expect(res.allPassed).toBe(true);
    expect(res.results[0].passed).toBe(true);
  });
});
