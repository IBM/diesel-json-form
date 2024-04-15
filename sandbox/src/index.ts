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

import "./style.css";
import "@diesel-parser/json-form/dist/JsonEditor.css";
import ReactDOM from "react-dom";
import * as JsonForm from "@diesel-parser/json-form";
import { RendererFactory } from "@diesel-parser/json-form";

import { editor1, editor2 } from "./text-editor";
import { MyStringRenderer } from "./MyStringRenderer";
import { RatingRenderer } from "./RatingRenderer";
import { MyObjectRenderer } from "./MyObjectRenderer";
import { initialSchema, initialValue, samples } from "./initdata";

const MyRendererFactory = new RendererFactory();
MyRendererFactory.addRenderer("MyStringRenderer", MyStringRenderer);
MyRendererFactory.addRenderer("RatingRenderer", RatingRenderer);
MyRendererFactory.addRenderer("MyObjectRenderer", MyObjectRenderer);

editor1.getModel()?.onDidChangeContent((e) => {
  sendJsonStr();
});

function getSchema() {
  const value = editor1.getValue();
  return JsonForm.parseJsonValue(value).toMaybe();
}

function getValue() {
  const v = editor2.getValue();
  return JsonForm.parseJsonValue(v).toMaybe().withDefault(JsonForm.jvNull);
}

function sendJsonStr() {
  const schema = getSchema();
  const value = getValue();
  console.log("send JSON str", schema, value);
  JsonForm.sendJsonPort.send([schema, value]);
}

const syncPanesCb: HTMLInputElement = document.getElementById(
  "syncPanes"
) as HTMLInputElement;

editor2.getModel()?.onDidChangeContent((e) => {
  console.log("ed2 change");
  if (syncPanesCb.checked) {
    sendJsonStr();
  }
});

const sampleSchemaSelect = document.getElementById(
  "sampleSchemaSelect"
) as HTMLSelectElement;

samples
  .map((s) => {
    const e = document.createElement("option");
    e.value = s[1];
    e.innerHTML = s[0];
    return e;
  })
  .forEach((e) => sampleSchemaSelect.appendChild(e));

sampleSchemaSelect.addEventListener("change", () => {
  editor1.setValue(sampleSchemaSelect.value);
  sendJsonStr();
});

const schema = JsonForm.valueFromAny(initialSchema).toMaybe();
const valueRes = JsonForm.valueFromAny(initialValue);

const jsonForm = document.getElementById("json-form");
if (!jsonForm) {
  throw new Error("json-form elem not found");
}

const strictMode = false;
const strictModeCb: HTMLInputElement = document.getElementById(
  "strictMode"
) as HTMLInputElement;
strictModeCb.checked = strictMode;
strictModeCb.addEventListener("change", () => {
  // ReactDOM.unmountComponentAtNode(jsonForm);
  // initJsonForm(getSchema(), getValue(), strictModeCb.checked)
  JsonForm.setStrictModePort.send(strictModeCb.checked);
});

switch (valueRes.tag) {
  case "Err": {
    const errNode = document.createElement("div");
    errNode.appendChild(document.createTextNode(valueRes.err));
    jsonForm.appendChild(errNode);
    break;
  }
  case "Ok": {
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
        console.log("value changed");
        if (syncPanesCb.checked) {
          const va = JsonForm.valueToAny(value);
          editor2.setValue(JSON.stringify(va, null, "  "));
        }
      },
      strictMode,
      rendererFactory: MyRendererFactory,
    }),
    jsonForm
  );
}
