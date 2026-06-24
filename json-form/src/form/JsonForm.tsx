import { just, map2, nothing } from 'tea-cup-fp';
import { Renderer } from './Renderer.js';
import { findParent } from './findParent.js';
import { RenderedElement } from './RenderedElement.js';
import { ArrayElement } from './ArrayElement.js';
import { JsonValue, jvObject, stringify } from '../JsonValue.js';
import { defaultSchemaService, SchemaService } from '../SchemaService.js';
import { JsPath } from '../JsPath.js';
import { Metadata } from '../Metadata.js';
import { validateAndComputeMetadata } from '../validateAndComputeMetadata.js';
import { renderNewOrSetMetadata } from '../renderNewOrSetMetadata.js';
import { h } from '../MyJSXFactory.js';
import { empty } from './HtmlBuilder.js';
import { getAddFunction } from './AppendElement.js';
import { HeaderElement } from './HeaderElement.js';

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

  private headerContainer: HTMLElement = (
    <div className="json-form-header-container"></div>
  );
  private headerElement?: HeaderElement;
  private scrollPane: HTMLElement = (<div className="json-form-scrollpane" />);
  private element?: RenderedElement<JsonValue>;
  private VALIDATION_COUNTER = 0;
  private _schemaService: SchemaService = defaultSchemaService;
  private _schema: JsonValue = jvObject();
  private _renderer: Renderer = new Renderer();

  constructor() {
    super();
  }

  connectedCallback() {
    if (this.hideHeader) {
      this.headerContainer.style.display = 'none';
    }
    this.appendChild(this.headerContainer);
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
    this._renderer = renderer;
    if (this.element) {
      this.element.remove();
      delete this.element;
    }
    empty(this.headerContainer);
    const header = renderer.createHeaderElement();
    this.headerContainer.appendChild(header);
    this._schema = schema;
    this._schemaService = schemaService;
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
    this.headerElement?.setCounter(nbElems);
  }

  private doValidate(value: JsonValue): Promise<Metadata | undefined> {
    const validJson = map2(
      stringify(this._schema),
      stringify(value),
      () => true,
    ).withDefault(false);
    if (validJson) {
      this.VALIDATION_COUNTER++;
      const validationCounter = this.VALIDATION_COUNTER;
      //   console.log('validate', validationCounter, value);
      const res = new Promise<Metadata | undefined>((resolve, reject) => {
        // setTimeout(() => {
        validateAndComputeMetadata(this._schemaService, this._schema, value)
          .then((metadata) => {
            // console.log('validated', metadata);
            if (validationCounter === this.VALIDATION_COUNTER) {
              //   console.log(
              //     'validate',
              //     validationCounter,
              //     this.VALIDATION_COUNTER,
              //     metadata,
              //   );
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
          if (metadata && this.element && this._renderer) {
            const e = renderNewOrSetMetadata(
              this.element,
              metadata,
              JsPath.empty,
              this._renderer,
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

  get schema(): JsonValue {
    return this._schema;
  }

  get schemaService(): SchemaService {
    return this._schemaService;
  }

  set schemaService(schemaService: SchemaService) {
    this._schemaService = schemaService;
    this.onChange();
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

  get renderer(): Renderer {
    if (!this._renderer) {
      throw new Error('no renderer available');
    }
    return this._renderer;
  }

  get hideHeader() {
    return this.hasAttribute('hide-header');
  }

  set hideHeader(hide: boolean) {
    if (hide) {
      this.setAttribute('hide-header', '');
      this.headerContainer.style.display = 'none';
    } else {
      this.removeAttribute('hide-header');
      this.headerContainer.style.display = 'block';
    }
  }

  addPropertyOrElement() {
    getAddFunction(this.element)?.();
  }

  setValue(value: JsonValue): void {
    if (this._renderer) {
      this.initialize(this._renderer, this._schemaService, this._schema, value);
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
