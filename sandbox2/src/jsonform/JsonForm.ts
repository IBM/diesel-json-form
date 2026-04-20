import {
  defaultSchemaService,
  JsonValue,
  JsPath,
  jvNull,
  SchemaService,
} from '@diesel-parser/json-form';
import { JsonElement } from './JsonElement';
import { createDom } from './createDom';
import { computeInvalidNumberErrors, ValidationData } from './ValidationData';

export class JsonForm extends HTMLElement {
  static TAG_NAME = 'json-form';

  private root?: JsonElement<JsonValue>;
  private schemaService: SchemaService = defaultSchemaService;
  private schema?: JsonValue;
  private validationData: ValidationData = ValidationData.empty();

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
    const newRoot = createDom(value, this.validate.bind(this));
    this.root = newRoot;
    this.appendChild(newRoot);
    this.validate();
  }

  private validate() {
    const value = this.toValue();
    const invalidNumbers = computeInvalidNumberErrors(value);
    if (invalidNumbers.size > 0) {
      // no need to validate but handle invalid numbers
      if (this.validationData) {
        this.validationData.setInvalidNumberErrors(invalidNumbers);
      } else {
        this.validationData = ValidationData.empty();
        this.validationData.setInvalidNumberErrors(invalidNumbers);
      }
      this.root?.setValidationData(this.validationData, JsPath.empty);
    } else {
      if (this.schemaService && this.schema) {
        this.schemaService
          .validate(this.schema, value)
          .then((vr) => {
            this.validationData = ValidationData.fromValidationResult(vr);
            console.log('validated', value, this.validationData);
            this.root?.setValidationData(this.validationData, JsPath.empty);
          })
          .catch((err) => {
            console.error('validate error', err);
          });
      }
    }
  }
}
