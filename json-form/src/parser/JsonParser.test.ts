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

describe('JsonParser', () => {
  test('string', () => {
    expectEvents('"yalla"', ['value-string']);
  });
  test('two strings fail', () => {
    const p = new JsonParser('"foo""bar"');
    expect(p.hasNext()).toBe(true);
    expect(p.next()).toEqual('value-string');
    expect(p.hasNext()).toBe(true);
    try {
      p.next();
      fail('should have thrown');
    } catch (e) {
      expect(e).toEqual('done already');
    }
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
