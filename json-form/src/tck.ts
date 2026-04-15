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
  path: string,
  expected: readonly string[],
) {
  return new TckTest(
    title,
    parseUnsafe(title, schema),
    parseUnsafe(title, value),
    JsPath.parse(path),
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
}`,
  POLYMORPHISM: `{
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
    "$schema": "https://json-schema.org/draft/2019-09/schema",
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
  test('schema propose bool', `{ "type": "boolean" }`, 'null', '/', [
    'true',
    'false',
  ]),
  test('schema propose object', `{ "type": "object" }`, 'null', '/', ['{}']),
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
    '/',
    [`{"foo":null}`],
  ),
  test('propose attr nested', SCHEMA_NESTED, 'null', '/', [`{"foo": null}`]),
  test('propose array', `{"type": "array"}`, 'null', '/', [`[]`]),
  test('at path nested', SCHEMA_NESTED, `{"foo":null}`, '/foo', [
    `{"bar": null}`,
  ]),
  test('propose at path array', SCHEMA_ARRAY, '[]', '/0', [`0`]),
  test('propose at path array 2', SCHEMA_ARRAY, '[0]', '/0', [`0`]),
  test('examples long', EXAMPLES.LONG, 'null', '/', ['0', 'null']),
  test('examples string', EXAMPLES.STRING, 'null', '/', ['""', 'null']),
  test('examples EnumArray 1', EXAMPLES.ENUM_ARRAY, 'null', '/', [
    '[]',
    'null',
  ]),
  test('examples EnumArray 2', EXAMPLES.ENUM_ARRAY, '[]', '/0', [
    '"FOO"',
    '"BAR"',
  ]),
  test('examples Cycle 1', EXAMPLES.CYCLE, 'null', '/', [
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
    '/next',
    ['{"next":null,"name":null}'],
  ),
  test('examples Poly 1', EXAMPLES.POLYMORPHISM, '{}', '/', [
    '{}',
    '{"what":"schema.animal.Lion"}',
    '{"mane":null}',
    '{"name":null,"sound":null,"type":null,"endangered":null}',
    '{"what":"schema.animal.Elephant"}',
    '{"trunkLength":null,"tusk":null}',
  ]),
  test('examples Poly 2', EXAMPLES.POLYMORPHISM, '{"what":""}', '/what', [
    '"schema.animal.Lion"',
    '"schema.animal.Elephant"',
  ]),
  test(
    'examples Poly 3',
    EXAMPLES.POLYMORPHISM,
    '{"what": "schema.animal.Elephant"}',
    '/',
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
    '/',
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
    '/0',
    ['"FOO"', '"BAR"'],
  ),
  test(
    'propose enum in array at index 1',
    EXAMPLES.ENUM_ARRAY_WITHOUT_NULL,
    '["FOO",null]',
    '/1',
    ['"FOO"', '"BAR"'],
  ),
  test(
    'propose enum in array at invalid index',
    EXAMPLES.ENUM_ARRAY_WITHOUT_NULL,
    '["FOO"]',
    '/1',
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
    '/',
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
    '/',
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
    '/',
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
    '/',
    ['{"foo":"yalla"}', '{"foo":"bar"}', '{"foo":"baz"}'],
  ),
  test(
    'propose oneOf with const',
    SCHEMA_ONEOF_CONST,
    '{"what":"schema.animal.LionExtAn"}',
    '/',
    ['{"what":"schema.animal.LionExtAn","lion":null}'],
  ),
  test('propose oneOf with const 2', SCHEMA_ONEOF_CONST, '{}', '/', [
    '{"what":"schema.animal.LionExtAn","lion":null}',
    '{"what":"schema.animal.ElephantExtAn","elephant":null}',
  ]),
];
