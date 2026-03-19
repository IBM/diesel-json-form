/*
 * Copyright 2018 The Diesel Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as JsFacade from '@diesel-parser/json-schema-facade-ts';
import { jvObject, jvString, stringify } from './JsonValue';

describe('JsFacade', () => {
  test('should return schema validation markers when parsing', () => {
    const parseRequest = { text: 'true' };
    const parser = JsFacade.getJsonParser(
      JsFacade.parseValue(
        stringify(jvObject([{ name: 'type', value: jvString('string') }])),
      ),
    );
    const res = parser.parse(parseRequest);
    expect(res.success).toBe(true);
    expect(res.error).toBeUndefined;
    expect(res.markers.length).toBe(1);
    expect(res.markers[0].offset).toBe(0);
    expect(res.markers[0].length).toBe(4);
    expect(res.markers[0].severity).toBe('error');
    expect(res.markers[0].getMessage('en')).toBe(
      'Invalid type: expected string',
    );
  });
  test('should predict based on schema', () => {
    const predictRequest = { text: '{}', offset: 1 };
    const schema = JsFacade.parseValue(
      JSON.stringify({
        type: 'object',
        properties: {
          foo: {
            type: 'string',
          },
        },
      }),
    );
    const parser = JsFacade.getJsonParser(schema);
    const res = parser.predict(predictRequest);
    expect(res.success).toBe(true);
    expect(res.error).toBeUndefined;
    expect(res.proposals.length).toBe(3);
    expect(res.proposals[0].text).toBe('}');
    expect(res.proposals[1].text).toBe('"foo"');
    expect(res.proposals[2].text).toBe('""');
  });
});
