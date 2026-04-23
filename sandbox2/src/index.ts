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
  parseJsonValue,
  parseJsonValueUnsafe,
  stringify,
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
    return e;
  })
  .forEach((e) => sampleSchemaSelect.appendChild(e));

const initialSchema = `{"type":"object"}`;
const schema = parseJsonValueUnsafe(initialSchema);

const initialValue = `{
    "foo": "bar", 
    "baz": {
        "x": [
            1,
            2
        ]
    }
}`;
const value = parseJsonValueUnsafe(initialValue);

const taSchema = document.getElementById('ta-schema') as HTMLTextAreaElement;
taSchema.value = initialSchema;
const taJson = document.getElementById('ta-json') as HTMLTextAreaElement;
taJson.value = initialValue;

const btnFromForm = document.getElementById(
  'btn-from-form',
) as HTMLButtonElement;

taJson.addEventListener('input', () => {
  try {
    JSON.parse(taJson.value);
    btnToForm.disabled = false;
  } catch (err) {
    btnToForm.disabled = true;
  }
});

btnFromForm.addEventListener('click', () => {
  const value = jsonForm.toValue();
  const valueStr = stringify(value, '  ').withDefault(
    'Broken JSON from form (invalid numbers)',
  );
  taJson.value = valueStr;
});

const btnToForm = document.getElementById('btn-to-form') as HTMLButtonElement;

btnToForm.addEventListener('click', () => {
  const value = parseJsonValueUnsafe(taJson.value);
  const schema = parseJsonValueUnsafe(taSchema.value);
  jsonForm.init(defaultSchemaService, schema, value);
});

const jsonForm = document.getElementById('my-form') as JsonForm;
jsonForm.init(defaultSchemaService, schema, value);
jsonForm.addChangeListener((value) => {
  btnFromForm.disabled = !stringify(value)
    .map(() => true)
    .withDefault(false);
});

sampleSchemaSelect.addEventListener('change', () => {
  taSchema.value = sampleSchemaSelect.value;
  const value = jsonForm.toValue();
  parseJsonValue(taSchema.value).match(
    (schema) => jsonForm.init(defaultSchemaService, schema, value),
    (err) => console.error(err),
  );
});
