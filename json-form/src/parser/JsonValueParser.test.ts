import { ok } from 'tea-cup-core';
import {
  jvNumber,
  jvString,
  jvBool,
  jvObject,
  jvArray,
  jvNull,
  parseJsonValue,
  JsonValue,
} from '../JsonValue';

function expectOk(json: string, expected: JsonValue) {
  expect(parseJsonValue(json)).toEqual(ok(expected));
}

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
