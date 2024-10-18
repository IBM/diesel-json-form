import { Lexer, Token } from './Lexer';

function assertTokens(str: string, expected: readonly Token[]) {
  const tokens = Lexer.getTokens(str);
  expect(tokens).toEqual(expected);
}

describe('Lexer', () => {
  test('obj empty', () => {
    assertTokens('{}', [
      new Token('object-open', '{', 0),
      new Token('object-close', '}', 1),
    ]);
  });
  test('string empty', () => {
    assertTokens('""', [new Token('string', '""', 0)]);
  });
  test('string', () => {
    assertTokens('"yalla"', [new Token('string', '"yalla"', 0)]);
  });
  test('string with escaped double quotes', () => {
    assertTokens('"ya\\"lla"', [new Token('string', '"ya\\"lla"', 0)]);
  });
  test('number', () => {
    assertTokens('123', [new Token('numeric', '123', 0)]);
  });
  test('boolean', () => {
    assertTokens('true', [new Token('boolean', 'true', 0)]);
    assertTokens('false', [new Token('boolean', 'false', 0)]);
  });
  test('null', () => {
    assertTokens('null', [new Token('null', 'null', 0)]);
  });
  test('array empty', () => {
    assertTokens('[]', [
      new Token('array-open', '[', 0),
      new Token('array-close', ']', 1),
    ]);
  });
  test('array with values', () => {
    assertTokens('[true,false]', [
      new Token('array-open', '[', 0),
      new Token('boolean', 'true', 1),
      new Token('comma', ',', 5),
      new Token('boolean', 'false', 6),
      new Token('array-close', ']', 11),
    ]);
  });
  test('nums and commas', () => {
    assertTokens('1,23,4', [
      new Token('numeric', '1', 0),
      new Token('comma', ',', 1),
      new Token('numeric', '23', 2),
      new Token('comma', ',', 4),
      new Token('numeric', '4', 5),
    ]);
  });
  test('whitespaces 1', () => {
    assertTokens(' 1', [new Token('numeric', '1', 1)]);
  });
  test('whitespaces 2', () => {
    assertTokens(' 1 2 , ', [
      new Token('numeric', '1', 1),
      new Token('numeric', '2', 3),
      new Token('comma', ',', 5),
    ]);
  });
  test('whitespaces 3', () => {
    assertTokens('\t1\n2', [
      new Token('numeric', '1', 1),
      new Token('numeric', '2', 3),
    ]);
  });
});
