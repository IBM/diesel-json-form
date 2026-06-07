export function stringArrayEquals(
  a1: readonly string[],
  a2: readonly string[],
): boolean {
  if (a1 === a2) {
    return true;
  }
  if (a1.length !== a2.length) {
    return false;
  }
  for (let i = 0; i < a1.length; i++) {
    if (a1[i] !== a2[i]) {
      return false;
    }
  }
  return true;
}
