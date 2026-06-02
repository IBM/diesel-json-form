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

import './style.scss';
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

import '@carbon/web-components/es/components/dropdown/dropdown-item';
import '@carbon/web-components/es/components/button/button';
import { CDSComboBox } from '@carbon/web-components';

const sampleSchemaSelect = document.getElementById(
  'sampleSchemaSelect',
) as CDSComboBox;

samples
  .map((s) => {
    const e = document.createElement('cds-dropdown-item');
    e.setAttribute('value', s[1]);
    e.innerHTML = s[0];
    return e;
  })
  .forEach((e) => sampleSchemaSelect.appendChild(e));

const initialSchema = `{
  "$schema": "https://json-schema.org/draft/2019-09/schema",
  "$id": "http://schema.BeanWithBean",
  "type": "object",
  "properties": {
    "customer": {
      "$ref": "#/definitions/schema.Customer"
    }
  },
  "definitions": {
    "schema.Customer": {
      "type": "object",
      "properties": {
        "firstName": {
          "type": [
            "string",
            "null"
          ]
        },
        "lastName": {
          "type": [
            "string",
            "null"
          ]
        },
        "amount": {
          "type": "number",
          "format": "double"
        },
        "age": {
          "type": "integer",
          "format": "int32"
        }
      }
    }
  }
}`;
const schema = parseJsonValueUnsafe(initialSchema);

const initialValue = `{
  "customer": {
    "amount": 0,
    "firstName": "",
    "age": 0,
    "lastName": ""
  }
}`;
// const initialValue = `[1]`;
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

sampleSchemaSelect.addEventListener('cds-dropdown-selected', () => {
  taSchema.value = sampleSchemaSelect.value;
  const value = jsonForm.toValue();
  parseJsonValue(taSchema.value).match(
    (schema) => jsonForm.init(defaultSchemaService, schema, value),
    (err) => console.error(err),
  );
});
