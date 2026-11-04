export interface TestCase {
  id: string;
  description: string;
  input: any[];
  expected: any;
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface DSAProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Arrays' | 'Two Pointers' | 'Sliding Window' | 'Binary Search' | 'Dynamic Programming' | 'Trees';
  companies: string[];
  targetTimeComplexity: string;
  targetSpaceComplexity: string;
  description: string;
  examples: ProblemExample[];
  constraints: string[];
  hints: string[];
  functionName: string;
  starterCode: string;
  solutionCode: string;
  testCases: TestCase[];
}

export interface TestResult {
  testCaseId: string;
  description: string;
  passed: boolean;
  actual?: any;
  expected: any;
  error?: string;
  runtimeMs: number;
}

export interface SandboxedRunResult {
  allPassed: boolean;
  passedCount: number;
  totalCount: number;
  results: TestResult[];
  compilationError?: string;
  totalRuntimeMs: number;
}

export interface ProblemProgress {
  problemId: string;
  status: 'unattempted' | 'practicing' | 'mastered';
  lastPracticed?: string;
  nextReviewDate?: string;
  reviewIntervalDays: number;
  attemptsCount: number;
  bestRuntimeMs?: number;
}

export const dsaProblems: DSAProblem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum — Target Pair Discovery',
    difficulty: 'Easy',
    category: 'Arrays',
    companies: ['TCS Digital', 'Infosys DSE', 'Amazon', 'Wipro Turbo'],
    targetTimeComplexity: 'O(N)',
    targetSpaceComplexity: 'O(N)',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the **indices** of the two numbers such that they add up to \`target\`.
    
You may assume that each input would have **exactly one solution**, and you may not use the same element twice. You can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2, 7, 11, 15], target = 9',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3, 2, 4], target = 6',
        output: '[1, 2]'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    hints: [
      'A brute force O(N^2) double loop checks every pair, but is too slow for large inputs.',
      'Can you trade space for time? As you iterate, calculate complement = target - nums[i].',
      'Store each number and its index in a Hash Map. Check if complement already exists in map in O(1).'
    ],
    functionName: 'twoSum',
    starterCode: `function twoSum(nums, target) {
  // Write your O(N) hash map solution here
  
}`,
    solutionCode: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const comp = target - nums[i];
    if (map.has(comp)) {
      return [map.get(comp), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    testCases: [
      { id: 'ts_1', description: 'Standard sorted array pair', input: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { id: 'ts_2', description: 'Unsorted middle pair', input: [[3, 2, 4], 6], expected: [1, 2] },
      { id: 'ts_3', description: 'Duplicate numbers summing to target', input: [[3, 3], 6], expected: [0, 1] },
      { id: 'ts_4', description: 'Negative numbers present', input: [[-1, -2, -3, -4, -5], -8], expected: [2, 4] }
    ]
  },
  {
    id: 'container-with-most-water',
    title: 'Container With Most Water',
    difficulty: 'Medium',
    category: 'Two Pointers',
    companies: ['Microsoft', 'Google', 'Flipkart', 'Adobe'],
    targetTimeComplexity: 'O(N)',
    targetSpaceComplexity: 'O(1)',
    description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i-th\` line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.`,
    examples: [
      {
        input: 'height = [1,8,6,2,5,4,8,3,7]',
        output: '49',
        explanation: 'The lines are at index 1 (height 8) and index 8 (height 7). Width = 8 - 1 = 7. Height = min(8, 7) = 7. Area = 7 * 7 = 49.'
      },
      {
        input: 'height = [1,1]',
        output: '1'
      }
    ],
    constraints: [
      'n == height.length',
      '2 <= n <= 10^5',
      '0 <= height[i] <= 10^4'
    ],
    hints: [
      'Area between index left and right is (right - left) * min(height[left], height[right]).',
      'Start with the widest container: left = 0, right = n - 1.',
      'Which pointer should you move? Moving the taller line inward cannot increase the area because width decreases and min height cannot increase. Always move the shorter line inward!'
    ],
    functionName: 'maxArea',
    starterCode: `function maxArea(height) {
  // Write your O(N) two-pointer solution here
  
}`,
    solutionCode: `function maxArea(height) {
  let left = 0;
  let right = height.length - 1;
  let maxWater = 0;
  while (left < right) {
    const width = right - left;
    const h = Math.min(height[left], height[right]);
    const area = width * h;
    if (area > maxWater) maxWater = area;
    if (height[left] < height[right]) {
      left++;
    } else {
      right--;
    }
  }
  return maxWater;
}`,
    testCases: [
      { id: 'cw_1', description: 'Standard high-variance walls', input: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expected: 49 },
      { id: 'cw_2', description: 'Two identical heights', input: [[1, 1]], expected: 1 },
      { id: 'cw_3', description: 'Monotonically decreasing heights', input: [[4, 3, 2, 1, 4]], expected: 16 },
      { id: 'cw_4', description: 'Steep tall inner pillars', input: [[1, 2, 1]], expected: 2 }
    ]
  },
  {
    id: 'longest-substring-without-repeating',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    category: 'Sliding Window',
    companies: ['Amazon', 'Cognizant', 'Wipro Turbo', 'Cisco'],
    targetTimeComplexity: 'O(N)',
    targetSpaceComplexity: 'O(min(N, M))',
    description: `Given a string \`s\`, find the length of the **longest substring** without duplicate characters.`,
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.'
      },
      {
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.'
      },
      {
        input: 's = "pwwkew"',
        output: '3',
        explanation: 'The answer is "wke", with length of 3.'
      }
    ],
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.'
    ],
    hints: [
      'Use a sliding window [left, right] to maintain a window of unique characters.',
      'Use a Map to track the last seen index of each character.',
      'When character s[right] is seen at index idx >= left, slide left = idx + 1.'
    ],
    functionName: 'lengthOfLongestSubstring',
    starterCode: `function lengthOfLongestSubstring(s) {
  // Write your O(N) sliding window solution here
  
}`,
    solutionCode: `function lengthOfLongestSubstring(s) {
  const map = new Map();
  let maxLen = 0;
  let left = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (map.has(ch) && map.get(ch) >= left) {
      left = map.get(ch) + 1;
    }
    map.set(ch, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
    testCases: [
      { id: 'ls_1', description: 'Repeating pattern string', input: ['abcabcbb'], expected: 3 },
      { id: 'ls_2', description: 'Single character repeated', input: ['bbbbb'], expected: 1 },
      { id: 'ls_3', description: 'Inner substring longer', input: ['pwwkew'], expected: 3 },
      { id: 'ls_4', description: 'Empty string boundary', input: [''], expected: 0 },
      { id: 'ls_5', description: 'All distinct characters', input: ['abcdef'], expected: 6 }
    ]
  },
  {
    id: 'search-in-rotated-sorted-array',
    title: 'Search in Rotated Sorted Array',
    difficulty: 'Medium',
    category: 'Binary Search',
    companies: ['Flipkart', 'Paytm', 'Oracle', 'Goldman Sachs'],
    targetTimeComplexity: 'O(log N)',
    targetSpaceComplexity: 'O(1)',
    description: `There is an integer array \`nums\` sorted in ascending order (with distinct values) that is possibly rotated at an unknown pivot index \`k\`.

Given the array \`nums\` after the possible rotation and an integer \`target\`, return the index of \`target\` if it is in \`nums\`, or \`-1\` if it is not in \`nums\`. You must write an algorithm with \`O(log n)\` runtime complexity.`,
    examples: [
      {
        input: 'nums = [4,5,6,7,0,1,2], target = 0',
        output: '4'
      },
      {
        input: 'nums = [4,5,6,7,0,1,2], target = 3',
        output: '-1'
      }
    ],
    constraints: [
      '1 <= nums.length <= 5000',
      '-10^4 <= nums[i] <= 10^4',
      'All values of nums are unique.',
      'nums is an ascending array that is possibly rotated.'
    ],
    hints: [
      'In a rotated sorted array, when you split the array at mid, at least one half (left or right) is ALWAYS sorted.',
      'Check if nums[left] <= nums[mid]. If true, the left half is normally sorted.',
      'If left half is sorted, check if target lies between nums[left] and nums[mid]. Otherwise search right half.'
    ],
    functionName: 'search',
    starterCode: `function search(nums, target) {
  // Write your O(log N) binary search solution here
  
}`,
    solutionCode: `function search(nums, target) {
  let low = 0;
  let high = nums.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (nums[mid] === target) return mid;

    // Check if left half is sorted
    if (nums[low] <= nums[mid]) {
      if (nums[low] <= target && target < nums[mid]) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    } else {
      // Right half is sorted
      if (nums[mid] < target && target <= nums[high]) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
  }
  return -1;
}`,
    testCases: [
      { id: 'rs_1', description: 'Found in rotated right half', input: [[4, 5, 6, 7, 0, 1, 2], 0], expected: 4 },
      { id: 'rs_2', description: 'Element not present', input: [[4, 5, 6, 7, 0, 1, 2], 3], expected: -1 },
      { id: 'rs_3', description: 'Single element match', input: [[1], 1], expected: 0 },
      { id: 'rs_4', description: 'Found in left sorted half', input: [[6, 7, 0, 1, 2, 4, 5], 7], expected: 1 }
    ]
  },
  {
    id: 'maximum-subarray',
    title: 'Maximum Subarray (Kadane’s Algorithm)',
    difficulty: 'Easy',
    category: 'Dynamic Programming',
    companies: ['Capgemini', 'TCS Prime', 'Infosys', 'Accenture'],
    targetTimeComplexity: 'O(N)',
    targetSpaceComplexity: 'O(1)',
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return *its sum*.`,
    examples: [
      {
        input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
        output: '6',
        explanation: 'The subarray [4,-1,2,1] has the largest sum 6.'
      },
      {
        input: 'nums = [1]',
        output: '1'
      },
      {
        input: 'nums = [5,4,-1,7,8]',
        output: '23'
      }
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4'
    ],
    hints: [
      'Kadane’s Algorithm maintains two variables: currentMax and globalMax.',
      'At each index i, either add nums[i] to existing sum or start fresh from nums[i]: currentMax = max(nums[i], currentMax + nums[i]).',
      'Update globalMax = max(globalMax, currentMax).'
    ],
    functionName: 'maxSubArray',
    starterCode: `function maxSubArray(nums) {
  // Write your O(N) Kadane algorithm here
  
}`,
    solutionCode: `function maxSubArray(nums) {
  let currentMax = nums[0];
  let globalMax = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentMax = Math.max(nums[i], currentMax + nums[i]);
    if (currentMax > globalMax) {
      globalMax = currentMax;
    }
  }
  return globalMax;
}`,
    testCases: [
      { id: 'ms_1', description: 'Mixed positive and negative numbers', input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
      { id: 'ms_2', description: 'All negative numbers', input: [[-5, -3, -8, -1, -9]], expected: -1 },
      { id: 'ms_3', description: 'All positive numbers', input: [[5, 4, -1, 7, 8]], expected: 23 },
      { id: 'ms_4', description: 'Single element array', input: [[-10]], expected: -10 }
    ]
  },
  {
    id: 'coin-change',
    title: 'Coin Change — Minimum Coins',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    companies: ['Walmart Labs', 'Paytm', 'Amazon', 'Intuit'],
    targetTimeComplexity: 'O(amount * coins.length)',
    targetSpaceComplexity: 'O(amount)',
    description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return the *fewest number of coins* that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return \`-1\`. You may assume that you have an infinite number of each kind of coin.`,
    examples: [
      {
        input: 'coins = [1,2,5], amount = 11',
        output: '3',
        explanation: '11 = 5 + 5 + 1'
      },
      {
        input: 'coins = [2], amount = 3',
        output: '-1'
      },
      {
        input: 'coins = [1], amount = 0',
        output: '0'
      }
    ],
    constraints: [
      '1 <= coins.length <= 12',
      '1 <= coins[i] <= 2^31 - 1',
      '0 <= amount <= 10^4'
    ],
    hints: [
      'Define dp[i] as the minimum coins needed to make amount i.',
      'Initialize dp array of size amount + 1 with Infinity, except dp[0] = 0.',
      'For each coin c and amount i from c to amount: dp[i] = min(dp[i], dp[i - c] + 1).'
    ],
    functionName: 'coinChange',
    starterCode: `function coinChange(coins, amount) {
  // Write your bottom-up DP solution here
  
}`,
    solutionCode: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (const c of coins) {
    for (let i = c; i <= amount; i++) {
      dp[i] = Math.min(dp[i], dp[i - c] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
    testCases: [
      { id: 'cc_1', description: 'Standard denominations making 11', input: [[1, 2, 5], 11], expected: 3 },
      { id: 'cc_2', description: 'Impossible amount with single coin', input: [[2], 3], expected: -1 },
      { id: 'cc_3', description: 'Zero amount requires 0 coins', input: [[1], 0], expected: 0 },
      { id: 'cc_4', description: 'Large denominations', input: [[186, 419, 83, 408], 6249], expected: 20 }
    ]
  },
  {
    id: 'lowest-common-ancestor',
    title: 'Lowest Common Ancestor in Binary Tree',
    difficulty: 'Medium',
    category: 'Trees',
    companies: ['Cisco', 'Intuit', 'Oracle', 'Microsoft'],
    targetTimeComplexity: 'O(N)',
    targetSpaceComplexity: 'O(H)',
    description: `Given a binary tree, find the lowest common ancestor (LCA) of two given nodes in the tree.

According to the definition of LCA on Wikipedia: “The lowest common ancestor is defined between two nodes \`p\` and \`q\` as the lowest node in \`T\` that has both \`p\` and \`q\` as descendants (where we allow **a node to be a descendant of itself**).”`,
    examples: [
      {
        input: 'root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1',
        output: '3',
        explanation: 'The LCA of nodes 5 and 1 is 3.'
      },
      {
        input: 'root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4',
        output: '5',
        explanation: 'The LCA of nodes 5 and 4 is 5, since a node can be a descendant of itself.'
      }
    ],
    constraints: [
      'The number of nodes in the tree is in the range [2, 10^5].',
      '-10^9 <= Node.val <= 10^9',
      'All Node.val are unique.',
      'p != q and both p and q exist in the tree.'
    ],
    hints: [
      'Use post-order traversal (bottom-up recursion).',
      'If current node is null, p, or q, return current node.',
      'If both left and right recursive calls return non-null, current node is the LCA!'
    ],
    functionName: 'lowestCommonAncestor',
    starterCode: `function lowestCommonAncestor(root, pVal, qVal) {
  // Tree node structure: { val: number, left: TreeNode | null, right: TreeNode | null }
  // Return the LCA node value
  
}`,
    solutionCode: `function lowestCommonAncestor(root, pVal, qVal) {
  function traverse(node) {
    if (!node) return null;
    if (node.val === pVal || node.val === qVal) return node;
    const left = traverse(node.left);
    const right = traverse(node.right);
    if (left && right) return node;
    return left || right;
  }
  const lca = traverse(root);
  return lca ? lca.val : null;
}`,
    testCases: [
      {
        id: 'lca_1',
        description: 'LCA is root node',
        input: [
          {
            val: 3,
            left: { val: 5, left: { val: 6 }, right: { val: 2 } },
            right: { val: 1, left: { val: 0 }, right: { val: 8 } }
          },
          5,
          1
        ],
        expected: 3
      },
      {
        id: 'lca_2',
        description: 'LCA is one of the target nodes itself',
        input: [
          {
            val: 3,
            left: { val: 5, left: { val: 6 }, right: { val: 2, right: { val: 4 } } },
            right: { val: 1 }
          },
          5,
          4
        ],
        expected: 5
      }
    ]
  },
  {
    id: 'trapping-rain-water',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    category: 'Two Pointers',
    companies: ['Amazon', 'Goldman Sachs', 'Google', 'Flipkart'],
    targetTimeComplexity: 'O(N)',
    targetSpaceComplexity: 'O(1)',
    description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.`,
    examples: [
      {
        input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
        output: '6',
        explanation: 'The above elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped.'
      },
      {
        input: 'height = [4,2,0,3,2,5]',
        output: '9'
      }
    ],
    constraints: [
      'n == height.length',
      '1 <= n <= 2 * 10^4',
      '0 <= height[i] <= 10^5'
    ],
    hints: [
      'At any index i, water trapped is max(0, min(maxLeft[i], maxRight[i]) - height[i]).',
      'Can you optimize the O(N) space away? Use two pointers: left = 0, right = n - 1.',
      'Maintain leftMax and rightMax. Whichever side has a smaller max limits the water for that side, so advance that pointer.'
    ],
    functionName: 'trap',
    starterCode: `function trap(height) {
  // Write your O(N) time O(1) space two-pointer solution here
  
}`,
    solutionCode: `function trap(height) {
  let left = 0;
  let right = height.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let totalWater = 0;

  while (left < right) {
    if (height[left] < height[right]) {
      if (height[left] >= leftMax) {
        leftMax = height[left];
      } else {
        totalWater += leftMax - height[left];
      }
      left++;
    } else {
      if (height[right] >= rightMax) {
        rightMax = height[right];
      } else {
        totalWater += rightMax - height[right];
      }
      right--;
    }
  }
  return totalWater;
}`,
    testCases: [
      { id: 'trw_1', description: 'Standard irregular elevation terrain', input: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], expected: 6 },
      { id: 'trw_2', description: 'Deep valley basin', input: [[4, 2, 0, 3, 2, 5]], expected: 9 },
      { id: 'trw_3', description: 'Flat surface holds zero water', input: [[3, 3, 3]], expected: 0 },
      { id: 'trw_4', description: 'Monotonic ramp holds zero water', input: [[1, 2, 3, 4, 5]], expected: 0 }
    ]
  }
];

export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object' || a === null || b === null) return false;

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const k of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
    if (!deepEqual(a[k], b[k])) return false;
  }
  return true;
}

export function runSandboxedCode(userCode: string, functionName: string, testCases: TestCase[]): SandboxedRunResult {
  const results: TestResult[] = [];
  let userFn: any;

  try {
    // Construct safe Function scope shadowing dangerous browser/node globals
    const factory = new Function(
      'window',
      'document',
      'localStorage',
      'sessionStorage',
      'fetch',
      'XMLHttpRequest',
      'globalThis',
      'process',
      `
      "use strict";
      ${userCode}
      if (typeof ${functionName} !== 'function') {
        throw new Error('Function "${functionName}" is not defined.');
      }
      return ${functionName};
    `
    );
    userFn = factory(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
  } catch (err: any) {
    return {
      allPassed: false,
      passedCount: 0,
      totalCount: testCases.length,
      compilationError: err.message || 'Syntax or evaluation error in submitted code',
      results: [],
      totalRuntimeMs: 0
    };
  }

  let totalRuntime = 0;
  let passedCount = 0;

  for (const tc of testCases) {
    const t0 = performance.now();
    try {
      // Deep clone inputs to prevent mutation side-effects between test cases
      const clonedInput = JSON.parse(JSON.stringify(tc.input));
      const actual = userFn(...clonedInput);
      const elapsed = performance.now() - t0;
      totalRuntime += elapsed;

      // Check match: deep equal OR if both are length-2 arrays of numbers (e.g. Two Sum index pair in any order)
      let isMatch = deepEqual(actual, tc.expected);
      if (!isMatch && Array.isArray(actual) && Array.isArray(tc.expected) && actual.length === 2 && tc.expected.length === 2) {
        // Allow pair indices in any order when both elements match (Two Sum requirement)
        const sortedActual = [...actual].sort((a, b) => a - b);
        const sortedExpected = [...tc.expected].sort((a, b) => a - b);
        if (deepEqual(sortedActual, sortedExpected)) {
          isMatch = true;
        }
      }

      if (isMatch) passedCount++;

      results.push({
        testCaseId: tc.id,
        description: tc.description,
        passed: isMatch,
        actual,
        expected: tc.expected,
        runtimeMs: Number(elapsed.toFixed(3))
      });
    } catch (err: any) {
      const elapsed = performance.now() - t0;
      totalRuntime += elapsed;
      results.push({
        testCaseId: tc.id,
        description: tc.description,
        passed: false,
        error: err.message || 'Runtime execution exception',
        expected: tc.expected,
        runtimeMs: Number(elapsed.toFixed(3))
      });
    }
  }

  return {
    allPassed: passedCount === testCases.length,
    passedCount,
    totalCount: testCases.length,
    results,
    totalRuntimeMs: Number(totalRuntime.toFixed(3))
  };
}

export function calculateReadinessScore(progressList: ProblemProgress[]): number {
  if (dsaProblems.length === 0) return 0;
  let points = 0;
  const maxPoints = dsaProblems.reduce((acc, p) => {
    const weight = p.difficulty === 'Hard' ? 3 : p.difficulty === 'Medium' ? 2 : 1;
    return acc + weight;
  }, 0);

  for (const prog of progressList) {
    const prob = dsaProblems.find(p => p.id === prog.problemId);
    if (!prob) continue;
    const weight = prob.difficulty === 'Hard' ? 3 : prob.difficulty === 'Medium' ? 2 : 1;
    if (prog.status === 'mastered') {
      points += weight;
    } else if (prog.status === 'practicing') {
      points += weight * 0.5;
    }
  }

  return Math.min(100, Math.round((points / maxPoints) * 100));
}
