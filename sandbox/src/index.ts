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

// import {
//   BdslValueEditorFactory,
//   CodeMirrorTheme,
//   Configuration,
//   defaultEditorConfiguration,
//   defaultIntelliMirrorConfig,
//   defaultTheme,
//   IntelliMirror,
//   IntelliMirrorConfig,
//   Theme,
// } from 'intellimirror-editor';
// import { DieselParser } from '@diesel/diesel-web-parser';

// import './style.css';
// import '@diesel/json-form/dist/JsonEditor.css';
// import 'intellimirror-editor/dist/intellimirror.css';
// import ReactDOM from 'react-dom';
// import * as JsonForm from '@diesel/json-form';
// import { fillAbout } from './about';
// import big_sample from './big_sample.json';

// fillAbout(document.querySelector('#about') as HTMLElement);

// const el1 = document.querySelector('#editor1');
// const el2 = document.querySelector('#editor2');

// const imConfig: IntelliMirrorConfig = {
//   ...defaultIntelliMirrorConfig,
//   predictionConfig: {
//     ...defaultIntelliMirrorConfig.predictionConfig,
//     showDocumentation: false,
//   },
//   editorConfig: {
//     ...defaultEditorConfiguration,
//     theme: {
//       ...defaultTheme,
//       codeMirrorTheme: 'default',
//     },
//     locale: navigator.language,
//   },
// };

// const config1 = new Configuration(imConfig);
// const valueEditorFactory = new BdslValueEditorFactory(navigator.language);

// const initialSchema = {};
// const initialValue = {};

// const worker1 = new Worker('schemaWorker.js');
// const parser1 = DieselParser.create(worker1);
// const im1 = new IntelliMirror(el1 as HTMLElement, config1, parser1, valueEditorFactory);
// im1.setValue(JSON.stringify(initialSchema, null, '  '));

// function logIntelliMirror(title: string, im: IntelliMirror) {
//   im.addEventListener('refreshed', (im, e) => console.log(`${title} refreshed`, e.refreshOutput));
//   im.addEventListener('predict', (im, e) => console.log(`${title} predict`, e.predictionsOutput));
//   im.addEventListener('format', (im, e) => console.log(`${title} format`, e.formatOutput));
//   im.addEventListener('error', (im, e) => console.log(`${title} error`, e.error));
// }

// logIntelliMirror('IM1', im1);

// const worker2 = new Worker(new URL('diesel-json-worker.js', location.href));
// const parser2: DieselParser = DieselParser.create(worker2);

// const config2 = new Configuration(imConfig);
// const im2 = new IntelliMirror(el2 as HTMLElement, config2, parser2, valueEditorFactory);
// im2.setValue(JSON.stringify(initialValue, null, '  '));

// logIntelliMirror('IM2', im2);

// worker2.addEventListener('message', (val) => {
//   if (val.data === 'dsl-updated') {
//     im2.refresh();
//   }
// });

// im1.addEventListener('change', (instance) => {
//   worker2.postMessage({
//     kind: 'dsl-message',
//     schema: instance.getValue(),
//     language: navigator.language,
//   });
//   sendJsonStr();
// });

// function getSchema() {
//   return JsonForm.parseJsonValue(im1.getValue()).toMaybe();
// }

// function getValue() {
//   return JsonForm.parseJsonValue(im2.getValue()).toMaybe().withDefault(JsonForm.jvNull);
// }

// function sendJsonStr() {
//   const schema = getSchema();
//   const value = getValue();
//   JsonForm.sendJsonPort.send([schema, value]);
// }

// const syncPanesCb: HTMLInputElement = document.getElementById('syncPanes') as HTMLInputElement;

// im2.addEventListener('change', () => {
//   if (syncPanesCb.checked) {
//     sendJsonStr();
//   }
// });

// const sampleSchemaSelect = document.getElementById('sampleSchemaSelect') as HTMLSelectElement;

// const Sample_Long = `{
//   "type": [
//     "integer",
//     "null"
//   ],
//   "format": "int64"
// }`;

// const Sample_String = `{
//   "type": [
//     "string",
//     "null"
//   ]
// }`;

// const Sample_EnumArray = `{
//   "type": [
//     "array", "null"
//   ],
//   "items": {
//     "type": [ "string", "null" ],
//     "enum": [
//       "FOO", "BAR"
//     ]
//   }
// }`;

// const Sample_BeanContainingOtherBean = `{
//   "$schema": "https://json-schema.org/draft/2019-09/schema",
//   "$id": "http://schema.BeanWithBean",
//   "type": "object",
//   "properties": {
//     "customer": {
//       "$ref": "#/definitions/schema.Customer"
//     }
//   },
//   "definitions": {
//     "schema.Customer": {
//       "type": "object",
//       "properties": {
//         "firstName": {
//           "type": [
//             "string",
//             "null"
//           ]
//         },
//         "lastName": {
//           "type": [
//             "string",
//             "null"
//           ]
//         },
//         "amount": {
//           "type": "number",
//           "format": "double"
//         },
//         "age": {
//           "type": "integer",
//           "format": "int32"
//         }
//       }
//     }
//   }
// }`;

// const Sample_Inheritance = `{
//   "$schema": "https://json-schema.org/draft/2019-09/schema",
//   "$id": "http://schema.shape.Rectangle",
//   "type": "object",
//   "allOf": [
//     {
//       "$ref": "#/definitions/schema.shape.Shape"
//     }
//   ],
//   "properties": {
//     "height": {
//       "type": "integer",
//       "format": "int32"
//     },
//     "width": {
//       "type": "integer",
//       "format": "int32"
//     }
//   },
//   "definitions": {
//     "schema.shape.Shape": {
//       "type": "object",
//       "properties": {
//         "name": {
//           "type": [
//             "string",
//             "null"
//           ]
//         }
//       }
//     }
//   }
// }`;

// const Example_Polymorphism = `{
//   "$schema": "https://json-schema.org/draft/2019-09/schema",
//   "$id": "http://schema.animal.Animal",
//   "type": "object",
//   "allOf": [
//     {
//       "if": {
//         "properties": {
//           "what": {
//             "type": "string",
//             "const": "schema.animal.Lion"
//           }
//         }
//       },
//       "then": {
//         "$ref": "#/definitions/schema.animal.Lion"
//       }
//     },
//     {
//       "if": {
//         "properties": {
//           "what": {
//             "type": "string",
//             "const": "schema.animal.Elephant"
//           }
//         }
//       },
//       "then": {
//         "$ref": "#/definitions/schema.animal.Elephant"
//       }
//     }
//   ],
//   "definitions": {
//     "schema.animal.Animal": {
//       "properties": {
//         "name": {
//           "type": [
//             "string",
//             "null"
//           ]
//         },
//         "sound": {
//           "type": [
//             "string",
//             "null"
//           ]
//         },
//         "type": {
//           "type": [
//             "string",
//             "null"
//           ]
//         },
//         "endangered": {
//           "type": "boolean"
//         }
//       }
//     },
//     "schema.animal.Lion": {
//       "allOf": [
//         {
//           "$ref": "#/definitions/schema.animal.Animal"
//         }
//       ],
//       "properties": {
//         "mane": {
//           "type": "boolean"
//         }
//       }
//     },
//     "schema.animal.Elephant": {
//       "allOf": [
//         {
//           "$ref": "#/definitions/schema.animal.Animal"
//         }
//       ],
//       "properties": {
//         "trunkLength": {
//           "type": "number",
//           "format": "double"
//         },
//         "tusk": {
//           "type": "boolean"
//         }
//       }
//     }
//   }
// }`;

// const Example_Cycle = `{
//   "$schema": "https://json-schema.org/draft/2019-09/schema",
//   "$id": "http://schema.TestCyclic$Loop",
//   "type": "object",
//   "properties": {
//     "next": {
//       "$ref": "http://schema.TestCyclic$Loop"
//     },
//     "name": {
//       "type": [
//         "string",
//         "null"
//       ]
//     }
//   }
// }`;

// const Example_Unwrapping = `{
//   "$schema": "https://json-schema.org/draft/2019-09/schema",
//   "$id": "http://schema.TestUnwrapping$UnwrappingRoot",
//   "type": "object",
//   "properties": {
//     "age": {
//       "type": "integer",
//       "format": "int32"
//     },
//     "name.first": {
//       "type": [
//         "string",
//         "null"
//       ]
//     },
//     "name.last": {
//       "type": [
//         "string",
//         "null"
//       ]
//     }
//   }
// }`;

// const Example_Date = JSON.stringify(
//   {
//     type: 'string',
//     format: 'date',
//   },
//   null,
//   '  ',
// );

// const Example_Time = JSON.stringify(
//   {
//     type: 'string',
//     format: 'time',
//   },
//   null,
//   '  ',
// );

// const Example_DateTime = JSON.stringify(
//   {
//     type: 'string',
//     format: 'date-time',
//   },
//   null,
//   '  ',
// );

// const samples = [
//   ['All', '{}'],
//   ['Long', Sample_Long],
//   ['String', Sample_String],
//   ['EnumArray', Sample_EnumArray],
//   ['BeanContainingOtherBean', Sample_BeanContainingOtherBean],
//   ['Inheritance', Sample_Inheritance],
//   ['Polymorphism', Example_Polymorphism],
//   ['Cycle', Example_Cycle],
//   ['Unwrapping', Example_Unwrapping],
//   ['Date', Example_Date],
//   ['Time', Example_Time],
//   ['DateTime', Example_DateTime],
//   ['BigSample', JSON.stringify(big_sample, null, '  ')],
// ];

// samples
//   .map((s) => {
//     const e = document.createElement('option');
//     e.value = s[1];
//     e.innerHTML = s[0];
//     return e;
//   })
//   .forEach((e) => sampleSchemaSelect.appendChild(e));

// sampleSchemaSelect.addEventListener('change', () => {
//   im1.setValue(sampleSchemaSelect.value);
// });

// const themes = ['default', 'darcula', 'material-ocean'];

// const themeSelect: HTMLSelectElement = document.getElementById('themeSelect') as HTMLSelectElement;
// themes.forEach((t) => {
//   const option = document.createElement('option');
//   option.value = t;
//   option.innerHTML = t;
//   themeSelect.appendChild(option);
// });

// themeSelect.addEventListener('change', () => {
//   const t = themeSelect.value as CodeMirrorTheme;
//   [config1, config2].forEach((c) => {
//     const cur = c.get();
//     const curTheme: Theme = cur.editorConfig.theme || defaultTheme;
//     c.set({
//       ...cur,
//       editorConfig: {
//         ...cur.editorConfig,
//         theme: {
//           ...curTheme,
//           codeMirrorTheme: t,
//         },
//       },
//     });
//   });
// });

// const schema = JsonForm.valueFromAny(initialSchema).toMaybe();
// const valueRes = JsonForm.valueFromAny(initialValue);

// const jsonForm = document.getElementById('json-form');
// if (!jsonForm) {
//   throw new Error('json-form elem not found');
// }

// const strictMode = false;
// const strictModeCb: HTMLInputElement = document.getElementById('strictMode') as HTMLInputElement;
// strictModeCb.checked = strictMode;
// strictModeCb.addEventListener('change', () => {
//   // ReactDOM.unmountComponentAtNode(jsonForm);
//   // initJsonForm(getSchema(), getValue(), strictModeCb.checked)
//   JsonForm.setStrictModePort.send(strictModeCb.checked);
// });

// switch (valueRes.tag) {
//   case 'Err': {
//     const errNode = document.createElement('div');
//     errNode.appendChild(document.createTextNode(valueRes.err));
//     jsonForm.appendChild(errNode);
//     break;
//   }
//   case 'Ok': {
//     initJsonForm(schema, valueRes.value, strictMode);
//     break;
//   }
// }

// function initJsonForm(schema: any, value: any, strictMode: boolean) {
//   ReactDOM.render(
//     JsonForm.JsonEditor({
//       schema,
//       value,
//       language: navigator.language,
//       onChange: (value: JsonForm.JsonValue) => {
//         console.log('value changed');
//         if (syncPanesCb.checked) {
//           const va = JsonForm.valueToAny(value);
//           im2.setValue(JSON.stringify(va, null, '  '));
//         }
//       },
//       strictMode,
//     }),
//     jsonForm,
//   );
// }
