import { Event, JsonParser } from './JsonParser';

function collectEvents(parser: JsonParser): Event[] {
  const res: Event[] = [];
  while (parser.hasNext()) {
    res.push(parser.next());
  }
  return res;
}

function expectEvents(json: string, expected: Event[]) {
  const p = new JsonParser(json);
  const actual = collectEvents(p);
  expect(actual).toEqual(expected);
}

function expectError(json: string, reason: string) {
  const p = new JsonParser(json);
  try {
    while (p.hasNext()) {
      p.next();
    }
    fail('should have thrown');
  } catch (err) {
    expect(err).toBe(reason);
  }
}

describe('JsonParser', () => {
  test('string', () => {
    expectEvents('"yalla"', ['value-string']);
  });
  test('two strings fail', () => {
    expectError('"foo""bar"', 'done already');
  });
  test('object empty', () => {
    expectEvents('{}', ['start-object', 'end-object']);
  });
  test('object one prop', () => {
    expectEvents('{"x":"y"}', [
      'start-object',
      'key-name',
      'value-string',
      'end-object',
    ]);
  });
  test('object nested', () => {
    expectEvents('{"x":{"y":"z"}}', [
      'start-object',
      'key-name',
      'start-object',
      'key-name',
      'value-string',
      'end-object',
      'end-object',
    ]);
  });
  test('object multiple attrs', () => {
    expectEvents('{"x":"a","y":"b"}', [
      'start-object',
      'key-name',
      'value-string',
      'key-name',
      'value-string',
      'end-object',
    ]);
  });
  test('unexpected comma 1', () => {
    expectError('{,}', 'found unexpected comma at 1');
  });
  test('unexpected comma 2', () => {
    expectError('{"x","y"}', 'found unexpected comma at 4');
  });
  test('unexpected comma 3', () => {
    expectError('{,"x":"y"}', 'found unexpected comma at 8');
  });
  test('unexpected comma 4', () => {
    expectError('{"x",:"y"}', 'found unexpected comma at 4');
  });
  test('unexpected comma 5', () => {
    expectError('{"x":,"y"}', 'found unexpected comma at 5');
  });
  test('unexpected comma 6', () => {
    expectError('{"x":"y",}', 'found unexpected comma at 8');
  });
  test('array empty', () => {
    expectEvents('[]', ['start-array', 'end-array']);
  });
  test('array single elem', () => {
    expectEvents('["x"]', ['start-array', 'value-string', 'end-array']);
  });
  test('array two elems', () => {
    expectEvents('["x","y"]', [
      'start-array',
      'value-string',
      'value-string',
      'end-array',
    ]);
  });
  test('array nested', () => {
    expectEvents('[["a"], ["b","c"]]', [
      'start-array',
      'start-array',
      'value-string',
      'end-array',
      'start-array',
      'value-string',
      'value-string',
      'end-array',
      'end-array',
    ]);
  });

  // test('number', () => {
  //   expectOk('1234', jvNumber('1234'));
  // });
  // test('number XXL', () => {
  //   expectOk('9999999999999999', jvNumber('9999999999999999'));
  // });
  // test('null', () => {
  //   expectOk('null', jvNull);
  // });
  // test('boolean', () => {
  //   expectOk('true', jvBool(true));
  // });
  // test('object', () => {
  //   expectOk('{}', jvObject([]));
  // });
  // test('object2', () => {
  //   expectOk('{"foo":1}', jvObject([{ name: 'foo', value: jvNumber('1') }]));
  // });
  // test('object3', () => {
  //   expectOk(
  //     '{"a":{}}',
  //     jvObject([
  //       {
  //         name: 'a',
  //         value: jvObject([]),
  //       },
  //     ]),
  //   );
  // });
  // test('object4', () => {
  //   expectOk(
  //     '{"a":{"b":1}}',
  //     jvObject([
  //       {
  //         name: 'a',
  //         value: jvObject([
  //           {
  //             name: 'b',
  //             value: jvNumber('1'),
  //           },
  //         ]),
  //       },
  //     ]),
  //   );
  // });
  // test('array', () => {
  //   expectOk('[]', jvArray([]));
  // });
  // test('array2', () => {
  //   expectOk('[1]', jvArray([jvNumber('1')]));
  // });
  // test('array3', () => {
  //   expectOk('[1,null,true]', jvArray([jvNumber('1'), jvNull, jvBool(true)]));
  // });
});
