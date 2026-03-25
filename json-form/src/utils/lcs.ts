export interface OptionsLcs<T> {
  readonly isEqual?: (a: T, b: T) => boolean;
  readonly includeMatrix?: boolean;
}
export interface ResultLcs<T> {
  readonly sequence: readonly T[];
  readonly matrix?: readonly number[][];
}

export function calculateLcs<T>(
  l1: readonly T[],
  l2: readonly T[],
  options: OptionsLcs<T> = {},
): ResultLcs<T> {
  const { includeMatrix = false, isEqual } = options;

  const eq = isEqual ?? ((a, b) => a === b);

  const m = l1.length;
  const n = l2.length;

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0),
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (eq(l1[i - 1], l2[j - 1])) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const sequence = backtrackT(l1, l2, dp, m, n);

  const result: ResultLcs<T> = {
    sequence,
    matrix: includeMatrix ? dp : undefined,
  };

  return result;
}

/**
 * Backtracks through the DP matrix to construct the actual LCS string
 *
 * @param s1 - The first string
 * @param s2 - The second string
 * @param dp - The filled DP matrix
 * @param i - Current row index
 * @param j - Current column index
 * @returns The LCS string
 */
function backtrackT<T>(
  s1: readonly T[],
  s2: readonly T[],
  dp: number[][],
  i: number,
  j: number,
): readonly T[] {
  if (i === 0 || j === 0) {
    return [];
  }

  if (s1[i - 1] === s2[j - 1]) {
    // Characters match: this character is part of LCS
    return [...backtrackT(s1, s2, dp, i - 1, j - 1), s1[i - 1]];
  }

  // Characters don't match: move in the direction of larger value
  if (dp[i - 1][j] > dp[i][j - 1]) {
    return backtrackT(s1, s2, dp, i - 1, j);
  } else {
    return backtrackT(s1, s2, dp, i, j - 1);
  }
}
