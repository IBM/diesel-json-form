import { JsonValue, parseJsonValue } from './JsonValue';
import { JsPath } from './JsPath';
import { SchemaService } from './SchemaService';

export class TckTest {
  constructor(
    readonly title: string,
    readonly schema: JsonValue,
    readonly value: JsonValue,
    readonly path: JsPath,
    readonly expected: readonly JsonValue[],
  ) {}

  async getProposals(
    schemaService: SchemaService,
  ): Promise<readonly JsonValue[]> {
    return schemaService.propose(this.schema, this.value, this.path);
  }
}

function parseUnsafe(testName: string, s: string): JsonValue {
  return parseJsonValue(s)
    .toMaybe()
    .withDefaultSupply(() => {
      throw 'invalid json in ' + testName + '\n' + s;
    });
}

function test(
  title: string,
  schema: string,
  value: string,
  path: JsPath,
  expected: readonly string[],
) {
  return new TckTest(
    title,
    parseUnsafe(title, schema),
    parseUnsafe(title, value),
    path,
    expected.map((e) => parseUnsafe(title, e)),
  );
}

const SCHEMA_NESTED = `{
    "properties": {
        "foo": {
            "$ref": "#/$defs/bar"
        }
    },
    "$defs": {
        "bar": {
            "properties": {
                "bar": {
                    "type": "number"
                }
            }
        }
    }
}`;

const SCHEMA_ARRAY = `{
    "type": "array",
    "items": {
        "type": "number"
    }
}`;

const EXAMPLES = {
  LONG: `{
    "type": [
        "integer",
        "null"
    ],
    "format": "int64"
}`,
  STRING: `{
    "type": [
        "string",
        "null"
    ]
}`,
  ENUM_ARRAY: `{
    "type": [
        "array",
        "null"
    ],
    "items": {
        "type": [
            "string",
            "null"
        ],
        "enum": [
            "FOO",
            "BAR"
        ]
    }
}`,
  CYCLE: `{
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
}`,
  POLYMORPHISM: `{
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
}`,
  ENUM_ARRAY_WITHOUT_NULL: `{
  "type": "array",
  "items": {
    "type": "string",
    "enum": [
      "FOO",
      "BAR"
    ]
  }
}`,
};

const SCHEMA_ONEOF_CONST = `{
    "$id": "http://schema/animal/AnimalExtAn.json",
    "oneOf": [
        {
            "$ref": "#/$defs/schema.animal.LionExtAn"
        },
        {
            "$ref": "#/$defs/schema.animal.ElephantExtAn"
        }
    ],
    "$defs": {
        "schema.animal.LionExtAn": {
            "type": "object",
            "properties": {
                "what": {
                    "type": "string",
                    "const": "schema.animal.LionExtAn"
                },
                "lion": {
                    "type": "string"
                }
            }
        },
        "schema.animal.ElephantExtAn": {
            "type": "object",
            "properties": {
                "what": {
                    "type": "string",
                    "const": "schema.animal.ElephantExtAn"
                },
                "elephant": {
                    "type": "boolean"
                }
            }
        }
    }
}`;

export const TCK_TESTS: TckTest[] = [
  test('schema propose bool', `{ "type": "boolean" }`, 'null', JsPath.empty, [
    'true',
    'false',
  ]),
  test('schema propose object', `{ "type": "object" }`, 'null', JsPath.empty, [
    '{}',
  ]),
  test(
    'propose property',
    `{
    "properties": {
        "foo": {
            "type": "string"
        }
    }
}`,
    'null',
    JsPath.empty,
    [`{"foo":null}`],
  ),
  test('propose attr nested', SCHEMA_NESTED, 'null', JsPath.empty, [
    `{"foo": null}`,
  ]),
  test('propose array', `{"type": "array"}`, 'null', JsPath.empty, [`[]`]),
  test(
    'at path nested',
    SCHEMA_NESTED,
    `{"foo":null}`,
    JsPath.empty.append('foo'),
    [`{"bar": null}`],
  ),
  test('propose at path array', SCHEMA_ARRAY, '[]', JsPath.empty.append(0), [
    `0`,
  ]),
  test('propose at path array 2', SCHEMA_ARRAY, '[0]', JsPath.empty.append(0), [
    `0`,
  ]),
  test('examples long', EXAMPLES.LONG, 'null', JsPath.empty, ['0', 'null']),
  test('examples string', EXAMPLES.STRING, 'null', JsPath.empty, [
    '""',
    'null',
  ]),
  test('examples EnumArray 1', EXAMPLES.ENUM_ARRAY, 'null', JsPath.empty, [
    '[]',
    'null',
  ]),
  test(
    'examples EnumArray 2',
    EXAMPLES.ENUM_ARRAY,
    '[]',
    JsPath.empty.append(0),
    ['"FOO"', '"BAR"'],
  ),
  test('examples Cycle 1', EXAMPLES.CYCLE, 'null', JsPath.empty, [
    '{"next":null,"name":null}',
  ]),
  test(
    'examples Cycle 2',
    EXAMPLES.CYCLE,
    `{
    "name": "",
    "next": {
        "name": "",
        "next": {}
    }
}`,
    JsPath.empty.append('next'),
    ['{"next":null,"name":null}'],
  ),
  test('examples Poly 1', EXAMPLES.POLYMORPHISM, '{}', JsPath.empty, [
    '{}',
    '{"what":"schema.animal.Lion"}',
    '{"mane":null}',
    '{"name":null,"sound":null,"type":null,"endangered":null}',
    '{"what":"schema.animal.Elephant"}',
    '{"trunkLength":null,"tusk":null}',
  ]),
  test(
    'examples Poly 2',
    EXAMPLES.POLYMORPHISM,
    '{"what":""}',
    JsPath.empty.append('what'),
    ['"schema.animal.Lion"', '"schema.animal.Elephant"'],
  ),
  test(
    'examples Poly 3',
    EXAMPLES.POLYMORPHISM,
    '{"what": "schema.animal.Elephant"}',
    JsPath.empty,
    [
      '{}',
      '{"what":"schema.animal.Elephant"}',
      '{"trunkLength":null,"tusk":null}',
      '{"name":null,"sound":null,"type":null,"endangered":null}',
    ],
  ),
  test(
    'examples Poly 4',
    EXAMPLES.POLYMORPHISM,
    '{"what": "schema.animal.Lion"}',
    JsPath.empty,
    [
      '{}',
      '{"what":"schema.animal.Lion"}',
      '{"mane":null}',
      '{"name":null,"sound":null,"type":null,"endangered":null}',
    ],
  ),
  test(
    'do not propose empty string if there is an enum',
    EXAMPLES.ENUM_ARRAY_WITHOUT_NULL,
    '[]',
    JsPath.empty.append(0),
    ['"FOO"', '"BAR"'],
  ),
  test(
    'propose enum in array at index 1',
    EXAMPLES.ENUM_ARRAY_WITHOUT_NULL,
    '["FOO",null]',
    JsPath.empty.append(1),
    ['"FOO"', '"BAR"'],
  ),
  test(
    'propose enum in array at invalid index',
    EXAMPLES.ENUM_ARRAY_WITHOUT_NULL,
    '["FOO"]',
    JsPath.empty.append(1),
    [],
  ),
  test(
    'propose with default',
    `{
 "type": "object",
 "properties": {
   "foo": {
     "type": "string"
   }
 },
 "default": {
   "foo": "bar"
 }
}`,
    '{}',
    JsPath.empty,
    ['{"foo":"bar"}'],
  ),
  test(
    'propose with one example',
    `{
 "type": "object",
 "properties": {
   "foo": {
     "type": "string"
   }
 },
 "examples": [
   {
     "foo": "bar"
   }
 ]
}`,
    '{}',
    JsPath.empty,
    ['{"foo":"bar"}'],
  ),
  test(
    'propose with two examples',
    `{
 "type": "object",
 "properties": {
   "foo": {
     "type": "string"
   }
 },
 "examples": [
   {
     "foo": "bar"
   },
   {
     "foo": "baz"
   }
 ]
}`,
    '{}',
    JsPath.empty,
    ['{"foo":"bar"}', '{"foo":"baz"}'],
  ),
  test(
    'propose with examples and default',
    `{
 "type": "object",
 "properties": {
   "foo": {
     "type": "string"
   }
 },
 "examples": [
   {
     "foo": "bar"
   },
   {
     "foo": "baz"
   }
 ],
 "default": {
   "foo": "yalla"
 }
}`,
    '{}',
    JsPath.empty,
    ['{"foo":"yalla"}', '{"foo":"bar"}', '{"foo":"baz"}'],
  ),
  test(
    'propose oneOf with const',
    SCHEMA_ONEOF_CONST,
    '{"what":"schema.animal.LionExtAn"}',
    JsPath.empty,
    ['{"what":"schema.animal.LionExtAn","lion":null}'],
  ),
  test('propose oneOf with const 2', SCHEMA_ONEOF_CONST, '{}', JsPath.empty, [
    '{"what":"schema.animal.LionExtAn","lion":null}',
    '{"what":"schema.animal.ElephantExtAn","elephant":null}',
  ]),
];
