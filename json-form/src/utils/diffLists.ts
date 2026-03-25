import { OptionsLcs, calculateLcs } from './lcs';

export type DiffChange<T> =
  | { type: 'common'; leftIndex: number; rightIndex: number; value: T }
  | { type: 'add'; rightIndex: number; value: T }
  | { type: 'remove'; leftIndex: number; value: T };

export interface DiffResult<T> {
  readonly changes: readonly DiffChange<T>[];

  readonly additions: number;
  readonly deletions: number;
  readonly common: number;
}

export function diffLists<T>(
  oldList: readonly T[],
  newList: readonly T[],
  isEqual: OptionsLcs<T>['isEqual'] = (a, b) => a === b,
): DiffResult<T> {
  // Get the LCS with matrix for backtracking
  const lcsResult = calculateLcs(oldList, newList, {
    isEqual,
    includeMatrix: true,
  });
  const matrix = lcsResult.matrix!;

  const changes: DiffChange<T>[] = [];
  let additions = 0;
  let deletions = 0;
  let common = 0;

  const l1 = oldList;
  const s2 = newList;

  let i = l1.length;
  let j = s2.length;

  // Backtrack through the matrix to build the diff
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && l1[i - 1] === s2[j - 1]) {
      // Characters match - this is common
      changes.unshift({
        type: 'common',
        value: oldList[i - 1], // Use original string for proper casing
        leftIndex: i - 1,
        rightIndex: j - 1,
      });
      common++;
      i--;
      j--;
    } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
      // Character was added in new string
      changes.unshift({
        type: 'add',
        value: newList[j - 1], // Use original string for proper casing
        rightIndex: j - 1,
      });
      additions++;
      j--;
    } else if (i > 0) {
      // Character was removed from old string
      changes.unshift({
        type: 'remove',
        value: oldList[i - 1], // Use original string for proper casing
        leftIndex: i - 1,
      });
      deletions++;
      i--;
    }
  }

  return {
    changes,
    additions,
    deletions,
    common,
  };
}

export function formatDiffResult<T>(
  diffResult: DiffResult<T>,
): readonly string[] {
  return diffResult.changes.map((change) => {
    switch (change.type) {
      case 'add':
        return `+ ${change.value}`;
      case 'remove':
        return `- ${change.value}`;
      case 'common':
        return `  ${change.value}`;
    }
  });
}
