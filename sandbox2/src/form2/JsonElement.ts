import {
  JsonValue,
  JsPath,
  jvArray,
  jvBool,
  jvNull,
  jvNumber,
  jvObject,
  jvString,
  Metadata,
} from '@diesel-parser/json-form';
import { JsonForm } from './JsonForm';
import { StringElement } from './StringElement';
import { NumberElement } from './NumberElement';
import { BooleanElement } from './BooleanElement';
import { ObjectElement } from './ObjectElement';
import { ArrayElement } from './ArrayElement';
import { getRendererKey, Renderer, RendererKey } from './Renderer';
import { RenderedElement } from './RenderedElement';

export class JsonElement extends HTMLElement {
  static TAG_NAME = 'json-element';

  private renderedElement?: RenderedElement;
  private rendererKey?: RendererKey;
  private type?: JsonValue['tag'];

  constructor() {
    super();
  }

  static newInstance(
    renderer: Renderer,
    value: JsonValue,
    metadata: Metadata,
    path: JsPath,
  ): JsonElement {
    const e = document.createElement(JsonElement.TAG_NAME) as JsonElement;
    e.initialize(renderer, value, metadata, path);
    return e;
  }

  private initialize(
    renderer: Renderer,
    value: JsonValue,
    metadata: Metadata,
    path: JsPath,
  ): void {
    this.type = value.tag;
    this.rendererKey = getRendererKey(value.tag, metadata, path);
    this.renderedElement = renderer.render({
      key: this.rendererKey,
      value,
      metadata,
      path,
      onChange: this.onChange.bind(this),
    });
    this.appendChild(this.renderedElement);
  }

  private onChange(): void {
    this.findEnclosingForm().onChange();
  }

  private findEnclosingForm(): JsonForm {
    let p = this.parentElement;
    while (p) {
      if (p instanceof JsonForm) {
        return p;
      }
      p = this.parentElement;
    }
    throw 'no enclosing json-form';
  }

  setMetadata(renderer: Renderer, metadata: Metadata, path: JsPath) {
    if (this.type) {
      const newKey = getRendererKey(this.type, metadata, path);
      if (this.rendererKey !== undefined && newKey.equals(this.rendererKey)) {
        const value = this.toValue();
        this.renderedElement?.remove();
        this.renderedElement = renderer.render({
          key: newKey,
          value,
          metadata,
          path,
          onChange: this.onChange.bind(this),
        });
        this.rendererKey = newKey;
        this.appendChild(this.renderedElement);
      } else {
        this.renderedElement?.setMetadata(metadata, path);
      }
    }
  }

  toValue(): JsonValue {
    if (this.type === undefined) {
      throw 'type is undefined';
    }
    switch (this.type) {
      case 'jv-null': {
        return jvNull;
      }
      case 'jv-string': {
        if (this.renderedElement instanceof StringElement) {
          return jvString(this.renderedElement.getStrValue());
        }
        throw 'Invalid rendered element type ' + this.type;
      }
      case 'jv-boolean': {
        if (this.renderedElement instanceof BooleanElement) {
          return jvBool(this.renderedElement.getBooleanValue());
        }
        throw 'Invalid rendered element type ' + this.type;
      }
      case 'jv-number': {
        if (this.renderedElement instanceof NumberElement) {
          return jvNumber(this.renderedElement.getNumValue());
        }
        throw 'Invalid rendered element type ' + this.type;
      }
      case 'jv-array': {
        if (this.renderedElement instanceof ArrayElement) {
          return jvArray(
            this.renderedElement.getElements().map((e) => e.toValue()),
          );
        }
        throw 'Invalid rendered element type ' + this.type;
      }
      case 'jv-object': {
        if (this.renderedElement instanceof ObjectElement) {
          return jvObject(
            this.renderedElement
              .getProperties()
              .map(([name, elem]) => ({ name, value: elem.toValue() })),
          );
        }
        throw 'Invalid rendered element type ' + this.type;
      }
    }
  }
}

customElements.define(JsonElement.TAG_NAME, JsonElement);
