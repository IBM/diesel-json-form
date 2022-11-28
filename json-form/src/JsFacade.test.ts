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

import { validate, getErrors, JsValidationError, propose } from './JsFacade';

function withErrors(
  schema: any,
  value: any,
  f: (errors: ReadonlyArray<JsValidationError>) => void,
) {
  const res = validate(schema, value);
  const errors = getErrors(res);
  expect(schema).toBe(res.schema);
  expect(value).toBe(res.value);
  f(errors);
}

describe('validate', () => {
  test('string ok', () => {
    withErrors(
      {
        type: 'string',
      },
      'toto',
      (errors) => expect(errors.length).toBe(0),
    );
  });
  test('string ko', () => {
    withErrors(
      {
        type: 'string',
      },
      123,
      (errors) => {
        expect(errors.length).toBe(1);
        expect(errors[0].path).toBe('');
        expect(errors[0].message).toBe('Invalid type: expected string');
      },
    );
  });
});

function withProposals(
  schema: any,
  value: any,
  path: string,
  maxDepth: number,
  f: (proposals: ReadonlyArray<any>) => void,
) {
  const res = validate(schema, value);
  expect(schema).toBe(res.schema);
  expect(value).toBe(res.value);
  const proposals = propose(res, path, maxDepth);
  f(proposals);
}

describe('propose', () => {
  test('string', () => {
    withProposals(
      {
        type: 'string',
      },
      'foo',
      '',
      -1,
      (proposals) => {
        expect(proposals.length).toBe(1);
        expect(proposals[0]).toBe('');
      },
    );
  });

  const objectSchemaFooBar = {
    properties: {
      foo: {
        type: 'string',
      },
      bar: {
        type: 'number',
      },
    },
  };

  test('object depth 1', () => {
    withProposals(objectSchemaFooBar, {}, '', -1, (proposals) => {
      expect(proposals.length).toBe(1);
      expect(proposals[0]).toEqual({ foo: null, bar: null });
    });
  });
  test('object depth 2', () => {
    withProposals(objectSchemaFooBar, {}, '', 2, (proposals) => {
      expect(proposals.length).toBe(1);
      expect(proposals[0]).toEqual({ foo: '', bar: 0 });
    });
  });
});
