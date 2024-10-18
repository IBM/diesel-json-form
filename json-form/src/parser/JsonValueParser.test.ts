import { ok } from 'tea-cup-core';
import {
  jvNumber,
  jvString,
  jvBool,
  jvObject,
  jvArray,
  jvNull,
  JsonValue,
  stringify,
} from '../JsonValue';
import { parseJsonValue } from './JsonValueParser';

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
  test('object3', () => {
    expectOk(
      '{"a":{}}',
      jvObject([
        {
          name: 'a',
          value: jvObject([]),
        },
      ]),
    );
  });
  test('object4', () => {
    expectOk(
      '{"a":{"b":1}}',
      jvObject([
        {
          name: 'a',
          value: jvObject([
            {
              name: 'b',
              value: jvNumber('1'),
            },
          ]),
        },
      ]),
    );
  });
  test('array', () => {
    expectOk('[]', jvArray([]));
  });
  test('array2', () => {
    expectOk('[1]', jvArray([jvNumber('1')]));
  });
  test('array3', () => {
    expectOk('[1,null,true]', jvArray([jvNumber('1'), jvNull, jvBool(true)]));
  });
});
