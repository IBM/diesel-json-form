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
import { FormHeaderElement } from './carbon/FormHeaderElement';

export class JsonForm extends HTMLElement {
  static TAG_NAME = 'json-form';

  private documentRoot: FormHeaderElement;
  private element?: JsonElement;
  private VALIDATION_COUNTER = 0;
  private schemaService: SchemaService = defaultSchemaService;
  private schema: JsonValue = jvObject();
  private renderer?: Renderer;

  constructor() {
    super();
    this.documentRoot = new FormHeaderElement();
  }

  connectedCallback() {
    this.appendChild(this.documentRoot);
  }

  disconnectedCallback() {
    this.documentRoot.remove();
    this.element?.remove();
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
            this.element.setMetadata(metadata, JsPath.empty, this.renderer);
          }
        })
        .catch((err) => {
          console.error('validation error ', err);
        });
    }
  }

  toValue(): JsonValue {
    if (!this.element) {
      throw new Error('not initialized');
    }
    return this.element.toValue();
  }

  getSchema(): JsonValue {
    return this.schema;
  }

  getSchemaService(): SchemaService {
    return this.schemaService;
  }

  get strictMode(): boolean {
    return this.hasAttribute('strict-mode');
  }

  getRenderer(): Renderer {
    if (!this.renderer) {
      throw new Error('no renderer available');
    }
    return this.renderer;
  }

  addPropertyOrElement() {
    this.element?.addPropertyOrElement();
  }

  setValue(value: JsonValue): void {
    if (this.renderer) {
      this.initialize(this.renderer, this.schemaService, this.schema, value);
    } else {
      throw new Error('No renderer found');
    }
  }

  deleteValue(): void {
    this.element?.remove();
    delete this.element;
  }
}

customElements.define(JsonForm.TAG_NAME, JsonForm);
