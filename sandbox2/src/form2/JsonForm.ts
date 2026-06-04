import {
  JsonValue,
  SchemaService,
  Metadata,
  stringify,
  validateAndComputeMetadata,
  JsPath,
  jvObject,
  defaultSchemaService,
} from '@diesel-parser/json-form';
import { just, map2, nothing } from 'tea-cup-fp';
import { getRendererKey, Renderer } from './Renderer';
import { FormHeaderElement } from './carbon/FormHeaderElement';
import { findParent } from './findParent';
import { RenderedElement } from './RenderedElement';
import { ArrayElement } from './ArrayElement';
import { ObjectElement } from './ObjectElement';

export class JsonForm extends HTMLElement {
  static TAG_NAME = 'json-form';

  private documentRoot: FormHeaderElement;
  private element?: RenderedElement<JsonValue>;
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
        if (metadata) {
          const key = getRendererKey(value.tag, metadata, JsPath.empty);
          const e = renderer.render({
            key,
            metadata,
            value,
            path: JsPath.empty,
          });
          this.appendChild(e);
        }
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
      const value = this.toValue();
      this.doValidate(value)
        .then((metadata) => {
          if (metadata && this.element && this.renderer) {
            const newKey = getRendererKey(
              this.element.getType(),
              metadata,
              JsPath.empty,
            );
            if (!newKey.equals(this.element.rendererKey!)) {
              const value = this.toValue();
              this.element?.remove();
              this.element = this.renderer.render({
                key: newKey,
                value,
                metadata,
                path: JsPath.empty,
              });
              this.appendChild(this.element);
            } else {
              this.element?.setMetadata(metadata, JsPath.empty, this.renderer);
            }
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
    if (this.element instanceof ArrayElement) {
      this.element.appendItem();
    } else if (this.element instanceof ObjectElement) {
      this.element.appendPropertyWithDialog();
    }
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

  static getEnclosingForm(e: Element): JsonForm {
    return findParent(e, (e) => {
      if (e instanceof JsonForm) {
        return just(e);
      }
      return nothing;
    });
  }
}

customElements.define(JsonForm.TAG_NAME, JsonForm);
