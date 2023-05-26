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
import { CustomRendererFactory } from "@diesel-parser/json-form";
import big_sample from "./big_sample.json";

import { editor1, editor2 } from "./text-editor";
import { MyStringRenderer } from "./MyStringRenderer";
import { RatingRenderer } from "./RatingRenderer";
import { MyObjectRenderer } from "./MyObjectRenderer";

const MyCustomRendererFactory = new CustomRendererFactory();
MyCustomRendererFactory.addRenderer("MyStringRenderer", MyStringRenderer);
MyCustomRendererFactory.addRenderer("RatingRenderer", RatingRenderer);
MyCustomRendererFactory.addRenderer("MyObjectRenderer", MyObjectRenderer);

const initialSchema = {};
const initialValue = {};

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

const Example_Renderer1 = `{
    "type": "string",
    "renderer": "MyStringRenderer"
}`;

const Example_Renderer2 = `{
    "type": "string",
    "renderer": {
        "key": "MyStringRenderer",
        "myConfigProp": 123
    }
}`;

const Example_Renderer3 = JSON.stringify(
  {
    properties: {
      name: {
        type: "string",
      },
      rating: {
        type: "number",
        renderer: "RatingRenderer",
      },
    },
  },
  null,
  "  "
);

const Example_Renderer4 = `
{
  "renderer": "MyObjectRenderer",
  "properties": {
    "name": {
      "type": "string"
    },
    "rating": {
      "type": "number",
      "renderer": "RatingRenderer"
    }
  }
}`;

const Example_Date = JSON.stringify(
  {
    type: "string",
    format: "date",
  },
  null,
  "  "
);

const Example_Time = JSON.stringify(
  {
    type: "string",
    format: "time",
  },
  null,
  "  "
);

const Example_DateTime = JSON.stringify(
  {
    type: "string",
    format: "date-time",
  },
  null,
  "  "
);

const Example_DateTimeWithExample = `{
  "type": [ "string", "null" ],
  "format": "date-time",
  "examples": [ "2022-11-28T09:27:17Z" ]
}`;

const samples = [
  ["All", "{}"],
  ["Long", Sample_Long],
  ["String", Sample_String],
  ["EnumArray", Sample_EnumArray],
  ["BeanContainingOtherBean", Sample_BeanContainingOtherBean],
  ["Inheritance", Sample_Inheritance],
  ["Polymorphism", Example_Polymorphism],
  ["Cycle", Example_Cycle],
  ["Unwrapping", Example_Unwrapping],
  ["Date", Example_Date],
  ["Time", Example_Time],
  ["DateTime", Example_DateTime],
  ["DateTimeExample", Example_DateTimeWithExample],
  ["BigSample", JSON.stringify(big_sample, null, "  ")],
  ["Renderer1", Example_Renderer1],
  ["Renderer2", Example_Renderer2],
  ["RendererRating", Example_Renderer3],
  ["RendererObject", Example_Renderer4],
];

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
      customRendererFactory: MyCustomRendererFactory,
    }),
    jsonForm
  );
}
