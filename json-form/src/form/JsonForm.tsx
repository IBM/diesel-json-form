import { just, map2, nothing } from 'tea-cup-fp';
import { Renderer } from './Renderer';
import { FormHeaderElement } from './carbon/FormHeaderElement';
import { findParent } from './findParent';
import { RenderedElement } from './RenderedElement';
import { ArrayElement } from './ArrayElement';
import { JsonValue, jvObject, stringify } from '../JsonValue';
import { defaultSchemaService, SchemaService } from '../SchemaService';
import { JsPath } from '../JsPath';
import { Metadata } from '../Metadata';
import { validateAndComputeMetadata } from '../validateAndComputeMetadata';
import { renderNewOrSetMetadata } from '../renderNewOrSetMetadata';
import { h } from '../MyJSXFactory';
import { empty } from './HtmlBuilder';
import { getAddFunction } from './AppendElement';

declare global {
  interface GlobalEventHandlersEventMap {
    'json-changed': JsonChangedEvent;
  }
}
export type TypedEvent<T extends EventTarget, D = unknown> = CustomEvent<D> & {
  target: T;
};

export type JsonChangedEvent = TypedEvent<JsonForm, JsonValue>;

export class JsonForm extends HTMLElement {
  static TAG_NAME = 'json-form';

  private headerElement: FormHeaderElement;
  private scrollPane: HTMLElement = (<div className="json-form-scrollpane" />);
  private element?: RenderedElement<JsonValue>;
  private VALIDATION_COUNTER = 0;
  private schemaService: SchemaService = defaultSchemaService;
  private schema: JsonValue = jvObject();
  private renderer: Renderer = new Renderer();

  constructor() {
    super();
    this.headerElement = new FormHeaderElement();
  }

  connectedCallback() {
    this.appendChild(this.headerElement);
    this.appendChild(
      <div className="json-form-scrollpane-wrapper">{this.scrollPane}</div>,
    );
  }

  disconnectedCallback() {
    empty(this);
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
      delete this.element;
    }
    this.schema = schema;
    this.schemaService = schemaService;
    this.doValidate(value)
      .then((metadata) => {
        if (metadata) {
          const e = renderer.render({
            metadata,
            value,
            path: JsPath.empty,
          });
          this.element = e;
          this.scrollPane.appendChild(e);
          this.updateHeaderCounter();
        }
      })
      .catch((err) => {
        console.error('form init error ', err);
      });
  }

  private updateHeaderCounter() {
    const nbElems =
      this.element instanceof ArrayElement
        ? this.element.toValue().elems.length
        : undefined;
    this.headerElement.setCounter(nbElems);
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
            console.log('validated', metadata);
            if (validationCounter === this.VALIDATION_COUNTER) {
              console.log(
                'validate',
                validationCounter,
                this.VALIDATION_COUNTER,
                metadata,
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
      this.updateHeaderCounter();
      const value = this.toValue();
      this.dispatchEvent(new CustomEvent('json-changed', { detail: value }));
      this.doValidate(value)
        .then((metadata) => {
          if (metadata && this.element && this.renderer) {
            const e = renderNewOrSetMetadata(
              this.element,
              metadata,
              JsPath.empty,
              this.renderer,
            );
            if (e) {
              this.element.remove();
              this.element = e;
              this.scrollPane.appendChild(this.element);
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

  set strictMode(s: boolean) {
    if (s) {
      this.setAttribute('strict-mode', '');
    } else {
      this.removeAttribute('strict-mode');
    }
  }

  get renderedElement(): RenderedElement<JsonValue> | undefined {
    return this.element;
  }

  getRenderer(): Renderer {
    if (!this.renderer) {
      throw new Error('no renderer available');
    }
    return this.renderer;
  }

  addPropertyOrElement() {
    getAddFunction(this.element)?.();
  }

  setValue(value: JsonValue): void {
    if (this.renderer) {
      this.initialize(this.renderer, this.schemaService, this.schema, value);
    } else {
      throw new Error('No renderer found');
    }
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
