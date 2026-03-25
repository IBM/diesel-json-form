import { DiffResult, DiffChange } from '@diesel-parser/json-form';

export function detectSingleUpdate<T>(diff: DiffResult<T>): DiffResult<T> {
  const empty: DiffChange<T>[] = [];
  const changes = diff.changes.reduce((acc, change) => {
    if (change.type === 'common') {
      acc.push(change);
    } else if (change.type === 'add') {
      const last = acc[acc.length - 1];
      if (
        last &&
        last.type === 'remove' &&
        last.leftIndex === change.rightIndex
      ) {
        acc[acc.length - 1] = {
          type: 'common',
          leftIndex: last.leftIndex,
          rightIndex: change.rightIndex,
          value: change.value,
        };
      } else {
        acc.push(change);
      }
    } else if (change.type === 'remove') {
      acc.push(change);
    }
    return acc;
  }, empty);
  return { ...diff, changes };
}
