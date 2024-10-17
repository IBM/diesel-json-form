import { ok } from 'tea-cup-core';
import {
  JsonValue,
  jvArray,
  jvBool,
  jvNull,
  jvNumber,
  jvObject,
  jvString,
} from './JsonValue';
import { Lexer, parseJsonValue, Token } from './JsonValueParser';

function expectOk(json: string, expected: JsonValue) {
  expect(parseJsonValue(json)).toEqual(ok(expected));
}

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
});

describe('JsonValueParser', () => {
  test('string', () => {
    expectOk('"yalla"', jvString('yalla'));
  });
  test('number', () => {
    expectOk('1234', jvNumber('1234'));
  });
  test('number XXL', () => {
    expectOk('9999999999999999', jvNumber('9999999999999999'));
  });
  test('null', () => {
    expectOk('null', jvNull);
  });
  test('boolean', () => {
    expectOk('true', jvBool(true));
  });
  test('object', () => {
    expectOk('{}', jvObject([]));
  });
  test('object2', () => {
    expectOk('{"foo":1}', jvObject([{ name: 'foo', value: jvNumber('1') }]));
  });
  test('array', () => {
    expectOk('[]', jvArray([]));
  });
  test('array2', () => {
    expectOk('[1,null,true]', jvArray([jvNumber('1'), jvNull, jvBool(true)]));
  });
});
