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
import '@diesel-parser/json-form/dist/JsonEditor.css';
import ReactDOM from 'react-dom';
import * as JsonForm from '@diesel-parser/json-form';
import big_sample from './big_sample.json';
import React from 'react';
import * as JsFacade from '@diesel-parser/json-schema-facade-ts';


const initialValue = `{
  "hello": "world"
}`
const initialSchema = `{
  "type": "boolean"
}`

function getParsed(value: string) {
  return JsonForm.parseJsonValue(value).toMaybe();
}

function replaceSchemaBy(value: string) {
  const transaction = viewSchema.state.update({
    changes: { from: 0, to: viewSchema.state.doc.length, insert: value }
  })
  viewSchema.dispatch(transaction)
}

function replaceValueBy(value: string) {
  const transaction = view.state.update({
    changes: { from: 0, to: view.state.doc.length, insert: value }
  })
  view.dispatch(transaction)
}

function sendJsonStr(schema: string, value: string) {
  const schema1 = getParsed(schema);
  const value1 = getParsed(value).withDefault(JsonForm.jvNull);
  console.log("send JSON str", schema1, value1);
  JsonForm.sendJsonPort.send([schema1, value1]);
}

const syncPanesCb: HTMLInputElement = document.getElementById('syncPanes') as HTMLInputElement;

const sampleSchemaSelect = document.getElementById('sampleSchemaSelect') as HTMLSelectElement;

const Sample_Long = `{
  "type": [
    "integer",
    "null"
  ],
  "format": "int64"
}`;

const Sample_String = `{
  "type": [
    "string",
    "null"
  ]
}`;

const Sample_EnumArray = `{
  "type": [
    "array", "null"
  ],
  "items": {
    "type": [ "string", "null" ],
    "enum": [
      "FOO", "BAR"
    ]
  }
}`;

const Sample_BeanContainingOtherBean = `{
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

const Sample_Inheritance = `{
  "$schema": "https://json-schema.org/draft/2019-09/schema",
  "$id": "http://schema.shape.Rectangle",
  "type": "object",
  "allOf": [
    {
      "$ref": "#/definitions/schema.shape.Shape"
    }
  ],
  "properties": {
    "height": {
      "type": "integer",
      "format": "int32"
    },
    "width": {
      "type": "integer",
      "format": "int32"
    }
  },
  "definitions": {
    "schema.shape.Shape": {
      "type": "object",
      "properties": {
        "name": {
          "type": [
            "string",
            "null"
          ]
        }
      }
    }
  }
}`;

const Example_Polymorphism = `{
  "$schema": "https://json-schema.org/draft/2019-09/schema",
  "$id": "http://schema.animal.Animal",
  "type": "object",
  "allOf": [
    {
      "if": {
        "properties": {
          "what": {
            "type": "string",
            "const": "schema.animal.Lion"
          }
        }
      },
      "then": {
        "$ref": "#/definitions/schema.animal.Lion"
      }
    },
    {
      "if": {
        "properties": {
          "what": {
            "type": "string",
            "const": "schema.animal.Elephant"
          }
        }
      },
      "then": {
        "$ref": "#/definitions/schema.animal.Elephant"
      }
    }
  ],
  "definitions": {
    "schema.animal.Animal": {
      "properties": {
        "name": {
          "type": [
            "string",
            "null"
          ]
        },
        "sound": {
          "type": [
            "string",
            "null"
          ]
        },
        "type": {
          "type": [
            "string",
            "null"
          ]
        },
        "endangered": {
          "type": "boolean"
        }
      }
    },
    "schema.animal.Lion": {
      "allOf": [
        {
          "$ref": "#/definitions/schema.animal.Animal"
        }
      ],
      "properties": {
        "mane": {
          "type": "boolean"
        }
      }
    },
    "schema.animal.Elephant": {
      "allOf": [
        {
          "$ref": "#/definitions/schema.animal.Animal"
        }
      ],
      "properties": {
        "trunkLength": {
          "type": "number",
          "format": "double"
        },
        "tusk": {
          "type": "boolean"
        }
      }
    }
  }
}`;

const Example_Cycle = `{
  "$schema": "https://json-schema.org/draft/2019-09/schema",
  "$id": "http://schema.TestCyclic$Loop",
  "type": "object",
  "properties": {
    "next": {
      "$ref": "http://schema.TestCyclic$Loop"
    },
    "name": {
      "type": [
        "string",
        "null"
      ]
    }
  }
}`;

const Example_Unwrapping = `{
  "$schema": "https://json-schema.org/draft/2019-09/schema",
  "$id": "http://schema.TestUnwrapping$UnwrappingRoot",
  "type": "object",
  "properties": {
    "age": {
      "type": "integer",
      "format": "int32"
    },
    "name.first": {
      "type": [
        "string",
        "null"
      ]
    },
    "name.last": {
      "type": [
        "string",
        "null"
      ]
    }
  }
}`;

const Example_Date = JSON.stringify(
  {
    type: 'string',
    format: 'date',
  },
  null,
  '  ',
);

const Example_Time = JSON.stringify(
  {
    type: 'string',
    format: 'time',
  },
  null,
  '  ',
);

const Example_DateTime = JSON.stringify(
  {
    type: 'string',
    format: 'date-time',
  },
  null,
  '  ',
);

const Example_DateTimeWithExample = `{
  "type": [ "string", "null" ],
  "format": "date-time",
  "examples": [ "2022-11-28T09:27:17Z" ]
}`;

const samples = [
  ['All', '{}'],
  ['Long', Sample_Long],
  ['String', Sample_String],
  ['EnumArray', Sample_EnumArray],
  ['BeanContainingOtherBean', Sample_BeanContainingOtherBean],
  ['Inheritance', Sample_Inheritance],
  ['Polymorphism', Example_Polymorphism],
  ['Cycle', Example_Cycle],
  ['Unwrapping', Example_Unwrapping],
  ['Date', Example_Date],
  ['Time', Example_Time],
  ['DateTime', Example_DateTime],
  ['DateTimeExample', Example_DateTimeWithExample],
  ['BigSample', JSON.stringify(big_sample, null, '  ')],
];

samples
  .map((s) => {
    const e = document.createElement('option');
    e.value = s[1];
    e.innerHTML = s[0];
    return e;
  })
  .forEach((e) => sampleSchemaSelect.appendChild(e));

sampleSchemaSelect.addEventListener('change', () => {
  replaceSchemaBy(sampleSchemaSelect.value)
  sendJsonStr(viewSchema.state.doc.sliceString(0), view.state.doc.sliceString(0));
});

const schema = JsonForm.valueFromAny(initialSchema).toMaybe();
const valueRes = JsonForm.valueFromAny(initialValue);

const jsonForm = document.getElementById('json-form');
if (!jsonForm) {
  throw new Error('json-form elem not found');
}

const strictMode = false;
const strictModeCb: HTMLInputElement = document.getElementById('strictMode') as HTMLInputElement;
strictModeCb.checked = strictMode;
strictModeCb.addEventListener('change', () => {
  // ReactDOM.unmountComponentAtNode(jsonForm);
  // initJsonForm(getSchema(), getValue(), strictModeCb.checked)
  JsonForm.setStrictModePort.send(strictModeCb.checked);
});

switch (valueRes.tag) {
  case 'Err': {
    const errNode = document.createElement('div');
    errNode.appendChild(document.createTextNode(valueRes.err));
    jsonForm.appendChild(errNode);
    break;
  }
  case 'Ok': {
    initJsonForm(schema, valueRes.value, strictMode);
    break;
  }
}

function initJsonForm(schema: any, value: any, strictMode: boolean) {
  ReactDOM.render(
    JsonForm.JsonEditor({
      schema,
      value,
      language: navigator.language,
      onChange: (value: JsonForm.JsonValue) => {
        console.log('value changed');
        if (syncPanesCb.checked) {
          const va = JsonForm.valueToAny(value);
          replaceValueBy(JSON.stringify(va, null, '  '));
        }
      },
      strictMode,
    }),
    jsonForm,
  );
}

// CODEMIRROR

import { autocompletion, Completion, CompletionResult, completionStatus } from "@codemirror/next/autocomplete"
import { CompletionConfig } from "@codemirror/next/autocomplete/src/config"
import { basicSetup, EditorState, EditorView } from "@codemirror/next/basic-setup"
import { closeBrackets } from "@codemirror/next/closebrackets"
import { json } from "@codemirror/next/lang-json"
import { Diagnostic, linter, lintKeymap } from "@codemirror/next/lint"
import { bracketMatching } from "@codemirror/next/matchbrackets"
import { keymap } from "@codemirror/next/view"
import { StateEffectType, StateEffect, StateField, EditorSelection } from '@codemirror/next/state';
import { makeCategorizer } from '@codemirror/next/state/src/charcategory';

// see https://codemirror.net/6/docs/ref/


const schemaUpdate: StateEffectType<string> = StateEffect.define()

const schemaField: StateField<JsFacade.DieselParserFacade> = StateField.define({
  create(state) {
    return JsFacade.getJsonParser({});
  },
  update(value, tr) {
    if (tr.docChanged) {
      sendJsonStr(tr.state.doc.sliceString(0), view.state.doc.sliceString(0))
    }
    return value
  }
})

const valueField: StateField<JsFacade.DieselParserFacade> = StateField.define({
  create(state) {
    return JsFacade.getJsonParser(initialSchema);
  },
  update(value, tr) {
    const schema = tr.effects.find(e => e.is(schemaUpdate))?.value
    if (schema) {
      const schemaJson = JSON.parse(schema)
      value = JsFacade.getJsonParser(schemaJson);
    }
    if (tr.docChanged) {
      sendJsonStr(schema as string, tr.state.doc.sliceString(0))
    }
    return value
  }
})

const state = EditorState.create({
  doc: initialValue,
  extensions: [
    basicSetup,
    json(),
    bracketMatching(),
    closeBrackets(),
    valueField,
    autocompletion(autocompleteConfig(valueField)),
    linter(linterFun(valueField)),
    // lintGutter(),
    keymap.of(lintKeymap)
    // keymap.of(completionKeymap)
  ],
});

const stateSchema = EditorState.create({
  doc: initialSchema,
  extensions: [
    basicSetup,
    json(),
    bracketMatching(),
    closeBrackets(),
    schemaField,
    autocompletion(autocompleteConfig(schemaField)),
    linter(linterFun(schemaField)),
    // lintGutter(),
    keymap.of(lintKeymap),
    // keymap.of(completionKeymap)
    EditorView.updateListener.of(update => {
      if (update.docChanged) {
        const pos = view.state.selection.mainIndex
        const transaction = view.state.update({
          effects: [schemaUpdate.of(update.state.doc.sliceString(0))],
          changes: [
            // noop triggers linter, but keeps caret
            { from: pos, to: pos + 1, insert: view.state.doc.slice(pos, pos + 1) },
          ]
        })
        view.dispatch(transaction)
      }
    })
  ],
});

function autocompleteConfig(field: StateField<JsFacade.DieselParserFacade>): CompletionConfig {
  return {
    activateOnTyping: false,
    defaultKeymap: true,
    override: [context => {
      return new Promise(resolve => {
        const parser = context.state.field(field)
        const request = JsFacade.DieselParsers.createPredictRequest(context.state.doc.sliceString(0), context.pos)
        const response = parser.predict(request)
        if (!response.success && response.proposals.length > 0) {
          return resolve(null)
        }
        // const theFirst = response.proposals[0]
        // const theStart = theSuggestion.start
        // const theEnd = theSuggestion.end
        const options = response.proposals.map(proposal => {
          const value = proposal.text
          return ({
            label: value,
            // info: value,
            apply: (view: EditorView, completion: Completion, from1: number, to1: number) => {
              const insert = completion.label
              const from = proposal.replace?.offset ?? from1 //theStart !== 0 ? theStart : from1
              const to = (proposal.replace?.length && (from + proposal.replace?.length)) || to1 //theStart !== 0 ? theEnd : to1
              const replace = view.state.update({
                changes: [
                  { from, to, insert }
                ],
                selection: EditorSelection.cursor(from + (insert?.length ?? 0))
              });
              view.update([replace])
            }
          });
        })
        return resolve({
          from: context.pos, //theStart !== 0 ? theStart : context.pos,
          to: context.pos,
          options
        });
      });
    }]
  }
}

function toSeverity(severity: string): Diagnostic['severity'] {
  switch (severity) {
    case 'info':
      return 'info';
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    default:
      return 'info';
  }
}

function linterFun(field: StateField<JsFacade.DieselParserFacade>) {
  return (view: EditorView) => {
    const parser = view.state.field(field)
    const request = JsFacade.DieselParsers.createParseRequest(view.state.doc.sliceString(0))
    const response = parser.parse(request)
    if (!response.success) {
      return []
    }
    const markers = response.markers
    const diagnostics: Diagnostic[] = markers.map(marker => ({
      from: marker.offset,
      to: marker.offset + marker.length,
      message: marker.getMessage('en'),
      severity: toSeverity(marker.severity),
      // source: 
    }));
    return diagnostics;
  }
}

const view = new EditorView({
  state,
  parent: document.querySelector("#editor2") || undefined
});

const viewSchema = new EditorView({
  state: stateSchema,
  parent: document.querySelector("#editor1") || undefined
});

view.setState(view.state.update({
  effects: [schemaUpdate.of(viewSchema.state.doc.sliceString(0))]
}).state);


// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).view = view;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).viewSchema = viewSchema
