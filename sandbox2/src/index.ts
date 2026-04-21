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

import './style.css';
import { samples } from './initdata';
import {
  defaultSchemaService,
  JsonValue,
  jvArray,
  jvBool,
  jvNumber,
  jvObject,
  jvString,
  parseJsonValue,
} from '@diesel-parser/json-form';
import { JsonForm } from './jsonform/JsonForm';
import { defineCustomElements } from './jsonform/defineCustomElements';

defineCustomElements();

const sampleSchemaSelect = document.getElementById(
  'sampleSchemaSelect',
) as HTMLSelectElement;

samples
  .map((s) => {
    const e = document.createElement('option');
    e.value = s[1];
    e.innerHTML = s[0];
    // e.selected = e.value.indexOf('BeanContaining') !== -1;
    return e;
  })
  .forEach((e) => sampleSchemaSelect.appendChild(e));

// const taSchema = document.getElementById('ta-schema') as HTMLTextAreaElement;

const jsonForm = document.getElementById('my-form') as JsonForm;

function unsafeParseJsonValue(json: string): JsonValue {
  return parseJsonValue(json).match(
    (v) => v,
    () => {
      throw new Error('booom');
    },
  );
}

const schema = unsafeParseJsonValue(`
    {
        "type": "array",
        "items": {
            "type": "number"
        }
    }`);

// const schema = unsafeParseJsonValue(`
//     {
//         "type": "object",
//         "properties": {
//             "foo": {
//                 "type": "number"
//             },
//             "bar": {
//                 "type": "string"
//             },
//             "toto": {
//                 "type": "boolean",
//                 "const": true
//             }
//         }
//     }`);

// const schema = unsafeParseJsonValue(`
//     {
//         "type": "number"
//     }`);

const value = jvArray([jvNumber('123'), jvNumber('456')]); //jvNumber('1234');

// const value = jvObject([
//   { name: 'foo', value: jvNumber('123') },
//   {
//     name: 'gnu',
//     value: jvArray([
//       jvNumber('222'),
//       jvString('bar'),
//       jvBool(true),
//       jvObject([
//         { name: 'hey', value: jvString('there') },
//         { name: 'gniii', value: jvBool(false) },
//       ]),
//     ]),
//   },
//   { name: 'toto', value: jvBool(false) },
// ]);
// const value = jvObject([{ name: 'foo', value: jvNumber('123') }]);

// const value = jvNumber('123');

jsonForm.init(defaultSchemaService, schema, value);

console.log('toValue:', jsonForm.toValue());

// sampleSchemaSelect.addEventListener('change', () => {
//   taSchema.value = sampleSchemaSelect.value;
//   // editor1.setValue(sampleSchemaSelect.value);
//   // sendJsonStr();
//   //   jsonForm.schema = JSON.parse(taSchema.value);

//   //   jsonForm.schema = JSON.parse(taSchema.value);
//   //   jsonForm.render(jvString('yalla'));
// });

// sampleSchemaSelect.value = 'BeanContainingOtherBean';

// const value = 'yalla';

// const value = [1, 2, 'foo', true, { foo: 'bar' }];

// const value = {};

// jsonForm.schema = {};

// valueFromAny(value).match(
//   (v) => jsonForm.render(v),
//   (err) => {
//     throw err;
//   },
// );

// jsonForm.value = toJsonNode('turbo');
