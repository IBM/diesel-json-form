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
  jvNull,
  jvObject,
  parseJsonValue,
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

const initialSchema = `{"type":"array"}`;
const schema = parseJsonValue(initialSchema).toMaybe().withDefault(jvObject());

const initialValue = `[]`;
const value = parseJsonValue(initialValue).toMaybe().withDefault(jvObject());

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
  const value = stringify(jsonForm.toValue(), '  ').withDefault(
    'Broken JSON from form (invalid numbers)',
  );
  taJson.value = value;
});

const btnToForm = document.getElementById('btn-to-form') as HTMLButtonElement;

btnToForm.addEventListener('click', () => {
  const value = parseJsonValue(taJson.value).withDefault(jvNull);
  const schema = parseJsonValue(taSchema.value);
  switch (schema.tag) {
    case 'Ok': {
      jsonForm.init(defaultSchemaService, schema.value, value);
      break;
    }
    case 'Err': {
      console.warn("schema isn't valid");
      break;
    }
  }
});

const jsonForm = document.getElementById('my-form') as JsonForm;
jsonForm.init(defaultSchemaService, schema, value);
jsonForm.addChangeListener((value) => {
  btnFromForm.disabled = !stringify(value)
    .map(() => true)
    .withDefault(false);
});

taJson.value = stringify(jsonForm.toValue(), '  ').withDefault('broken json');

sampleSchemaSelect.addEventListener('change', () => {
  taSchema.value = sampleSchemaSelect.value;
  const value = jsonForm.toValue();
  parseJsonValue(taSchema.value).match(
    (schema) => jsonForm.init(defaultSchemaService, schema, value),
    (err) => console.error(err),
  );
});
