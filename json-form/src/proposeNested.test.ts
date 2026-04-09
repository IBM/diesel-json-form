/*
 * Copyright 2018, 2026 The Diesel Authors
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

import { describe, test, expect } from 'vitest';
import {
  JsonValue,
  jvNull,
  jvNumber,
  jvObject,
  parseJsonValue,
} from './JsonValue';
import { defaultSchemaService } from './SchemaService';
import { JsPath } from './JsPath';
import { proposeNested } from './proposeNested';

function getSchema(): JsonValue {
  const schema = parseJsonValue(`{
          "properties": {
            "foo": {
              "$ref": "#/$defs/bar"
            }
          },
          "$defs": {
            "bar": {
              "properties": {
                "bar": {
                  "type": "number"
                }
              }
            }
          }
        }`);
  if (schema.tag === 'Err') {
    throw 'Parsing error ' + schema.err;
  }
  return schema.value;
}

describe('SchemaService', () => {
  test('propose -1', () => {
    assertSchemaProposals(getSchema(), jvObject(), JsPath.empty, -1, [
      jvObject([
        {
          name: 'foo',
          value: jvNull,
        },
      ]),
    ]);
  });

  test('propose 0', () => {
    assertSchemaProposals(getSchema(), jvObject(), JsPath.empty, 0, [
      jvObject([
        {
          name: 'foo',
          value: jvObject([{ name: 'bar', value: jvNull }]),
        },
      ]),
    ]);
  });

  test('propose 1', () => {
    assertSchemaProposals(getSchema(), jvObject(), JsPath.empty, 1, [
      jvObject([
        {
          name: 'foo',
          value: jvObject([{ name: 'bar', value: jvNumber('0') }]),
        },
      ]),
    ]);
  });

  test('propose nested', () => {
    assertSchemaProposals(getSchema(), jvObject(), JsPath.empty, 5, [
      jvObject([
        {
          name: 'foo',
          value: jvObject([{ name: 'bar', value: jvNumber('0') }]),
        },
      ]),
    ]);
  });
});

function assertSchemaProposals(
  schema: JsonValue,
  root: JsonValue,
  path: JsPath,
  maxDepth: number,
  expected: readonly JsonValue[],
) {
  const res = proposeNested(schema, defaultSchemaService, root, path, maxDepth);
  expect(res).toEqual(expected);
}
