import {
  JsonValue,
  SchemaService,
  Metadata,
  stringify,
  validateAndComputeMetadata,
  JsPath,
  emptyMetadata,
  jvObject,
  defaultSchemaService,
} from '@diesel-parser/json-form';
import { map2 } from 'tea-cup-fp';
import { JsonElement } from './JsonElement';
import { Renderer } from './Renderer';

export class JsonForm extends HTMLElement {
  static TAG_NAME = 'json-form';

  private element?: JsonElement;
  private VALIDATION_COUNTER = 0;
  private schemaService: SchemaService = defaultSchemaService;
  private schema: JsonValue = jvObject();
  renderer?: Renderer;

  constructor() {
    super();
  }

  initialize(
    renderer: Renderer,
    schemaService: SchemaService,
    schema: JsonValue,
    value: JsonValue,
  ) {
    this.renderer = renderer;
    if (this.element) {
      this.element.remove();
    }
    this.schema = schema;
    this.schemaService = schemaService;
    this.doValidate(value)
      .then((metadata) => {
        this.element = JsonElement.newInstance(
          renderer,
          value,
          metadata ?? emptyMetadata,
          JsPath.empty,
        );
        this.appendChild(this.element);
      })
      .catch((err) => {
        console.error('form init error ', err);
      });
  }

  private doValidate(value: JsonValue): Promise<Metadata | undefined> {
    const validJson = map2(
      stringify(this.schema),
      stringify(value),
      () => true,
    ).withDefault(false);
    if (validJson) {
      this.VALIDATION_COUNTER++;
      const validationCounter = this.VALIDATION_COUNTER;
      console.log('validate', validationCounter, value);
      const res = new Promise<Metadata | undefined>((resolve, reject) => {
        // setTimeout(() => {
        validateAndComputeMetadata(this.schemaService, this.schema, value)
          .then((metadata) => {
            if (validationCounter === this.VALIDATION_COUNTER) {
              console.log(
                'validate',
                validationCounter,
                this.VALIDATION_COUNTER,
              );
              resolve(metadata);
            } else {
              resolve(undefined);
            }
          })
          .catch((err) => {
            reject(err);
          });
        // }, 5000);
      });
      return res;
    } else {
      return Promise.reject('broken json');
    }
  }

  onChange(): void {
    if (this.element) {
      this.doValidate(this.toValue())
        .then((metadata) => {
          if (metadata && this.element && this.renderer) {
            this.element.setMetadata(this.renderer, metadata, JsPath.empty);
          }
        })
        .catch((err) => {
          console.error('validation error ', err);
        });
    }
  }

  toValue(): JsonValue {
    if (!this.element) {
      throw 'not initialized';
    }
    return this.element.toValue();
  }
}

customElements.define(JsonForm.TAG_NAME, JsonForm);
