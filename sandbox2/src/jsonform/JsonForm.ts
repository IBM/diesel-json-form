import {
  defaultSchemaService,
  JsonValue,
  JsPath,
  jvNull,
  SchemaService,
  ValidationResult,
} from '@diesel-parser/json-form';
import { JsonElement } from './JsonElement';
import { createDom } from './createDom';
import { ValidationData } from './ValidationData';

export class JsonForm extends HTMLElement {
  static TAG_NAME = 'json-form';

  private root?: JsonElement<JsonValue>;
  private schemaService: SchemaService = defaultSchemaService;
  private schema?: JsonValue;

  constructor() {
    super();
  }

  toValue(): JsonValue {
    if (this.root) {
      return this.root.toValue();
    }
    return jvNull;
  }

  init(schemaService: SchemaService, schema: JsonValue, value: JsonValue) {
    this.schemaService = schemaService;
    this.schema = schema;
    if (this.root) {
      this.removeChild(this.root);
    }
    const newRoot = createDom(value);
    this.root = newRoot;
    this.appendChild(newRoot);
    this.validate();
  }

  private validate() {
    if (this.schemaService && this.schema) {
      const value = this.toValue();
      this.schemaService
        .validate(this.schema, value)
        .then((vr) => this.gotValidationResult(vr, value))
        .catch((err) => {
          console.error('validate error', err);
        });
    }
  }

  private gotValidationResult(
    validationResult: ValidationResult,
    value: JsonValue,
  ) {
    console.log('gotValidationResult', validationResult, value);
    this.root?.setValidationData(
      new ValidationData(validationResult),
      JsPath.empty,
    );
  }
}
