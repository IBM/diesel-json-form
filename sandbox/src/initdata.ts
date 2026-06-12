import big_sample from './big_sample.json';

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

const Sample_ObjectArray = `{
  "type": [
    "array", "null"
  ],
  "items": {
    "type": [ "object", "null" ],
    "properties": {
      "foo": { "type": "number" },
      "bar": { "type": "boolean" }
    }
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
        type: 'string',
      },
      rating: {
        type: 'number',
        renderer: 'RatingRenderer',
      },
    },
  },
  null,
  '  ',
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

const Example_RendererStringCdsTextArea = `
{
  "properties": {
    "name": {
      "type": "string"
    },
    "comment": {
      "type": "string",
      "renderer": {
        "key": "string-cds-textarea",
        "attributes": {
            "rows": "12",
            "placeholder": "Enter a nice comment"
        }
      }
    }
  }
}`;

const Example_RendererStringCdsTextInput = `
{
  "properties": {
    "name": {
      "type": "string",
      "renderer": {
        "key": "string-cds-text-input",
        "attributes": {
            "placeholder": "Enter a flashy username"
        }
      }
    },
    "comment": {
      "type": "string"
    }
  }
}`;

const Example_RendererNumberCdsTextInput = `
{
  "properties": {
    "name": {
      "type": "string"
    },
    "rating": {
      "type": "number",
      "renderer": {
        "key": "number-cds-text-input",
        "attributes": {
            "placeholder": "Tell us about your rating"
        }
      }
    }
  }
}`;

const Example_RendererBooleanCdsCheckbox = `
{
  "properties": {
    "name": {
      "type": "string"
    },
    "passed": {
      "type": "boolean",
      "renderer": {
        "key": "boolean-cds-checkbox",
        "attributes": {
            "helper-text": "Hey hoooo"
        }
      }
    }
  }
}`;

const Example_RendererNullCdsTextInput = `
{
  "properties": {
    "name": {
      "type": "string"
    },
    "nullable": {
      "type": "null",
      "renderer": {
        "key": "null-cds-text-input",
        "attributes": {
            "helper-text": "Hey hoooo",
            "size": "xs",
            "label": "T'es nul"
        }
      }
    }
  }
}`;

const Example_RendererGridObject = `
{
  "renderer": {
    "key": "GridObject",
    "attributes": {
        "align": "start"
    },
    "columnAttributes": {
        "rating": {
            "span": "16"
        },
        "name": {
            "span": "4"
        },
        "age": {
            "span": "4"
        },
        "vip": {
            "span": "16"
        }
    }
  },
  "properties": {
    "vip": {
      "type": "boolean"
    },
    "age": {
      "type": "number",
      "renderer": {
         "key": "number-cds-text-input",
         "attributes": {
            "label": "... and the age"
         }
      }
    },
    "name": {
      "type": "string",
      "renderer": {
         "key": "string-cds-text-input",
         "attributes": {
            "label": "This is the name"
         }
      }
    },
    "rating": {
      "type": "number",
      "renderer": "RatingRenderer"
    },
    "other": {
      "type": "array"
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

export const Example_RendererTable = `
{ 
    "type": "object",
    "properties": {
        "firstName": {
            "type": "string"
        },
        "lastName": {
            "type": "string"
        },
        "category": {
            "type": "string",
            "enum": [
                "SILVER",
                "GOLD",
                "PLATINUM"
            ]
        },
        "lastOrders": {
            "type": "array", 
            "items": {
                "type": "object", 
                "properties": {
                    "productId": {
                        "type": "string",
                        "maxLength": 5
                    },
                    "amount": {
                        "type": "number"
                    },
                    "quantity": {
                        "type": "number"
                    }
                }
            },
            "renderer": {
                "key": "ArrayTable",
                "columns": ["productId", "amount", "quantity"]
            }
        }
    }
}`;

export const samples = [
  ['All', '{}'],
  ['Long', Sample_Long],
  ['String', Sample_String],
  ['EnumArray', Sample_EnumArray],
  ['ObjectArray', Sample_ObjectArray],
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
  ['Renderer1', Example_Renderer1],
  ['Renderer2', Example_Renderer2],
  ['RendererRating', Example_Renderer3],
  ['RendererObject', Example_Renderer4],
  ['RendererTable', Example_RendererTable],
  ['RendererStringCdsTextInput', Example_RendererStringCdsTextInput],
  ['RendererStringCdsTextArea', Example_RendererStringCdsTextArea],
  ['RendererNumberCdsTextInput', Example_RendererNumberCdsTextInput],
  ['RendererBooleanCdsCheckbox', Example_RendererBooleanCdsCheckbox],
  ['RendererNullCdsTextInput', Example_RendererNullCdsTextInput],
  ['RendererGridObject', Example_RendererGridObject],
];

export const initialSchema = {};
export const initialValue = {};
