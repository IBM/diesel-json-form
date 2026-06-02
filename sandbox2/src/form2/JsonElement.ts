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
import { StringElement } from './StringElement';
import { NumberElement } from './NumberElement';
import { BooleanElement } from './BooleanElement';
import { ObjectElement } from './ObjectElement';
import { ArrayElement } from './ArrayElement';
import { getRendererKey, Renderer, RendererKey } from './Renderer';
import { RenderedElement } from './RenderedElement';
import { NullElement } from './NullElement';

export class JsonElement extends HTMLElement {
  static TAG_NAME = 'json-element';

  private renderedElement?: RenderedElement;
  private rendererKey?: RendererKey;

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

  static findParentJsonElement(e: Element): JsonElement {
    let p = e.parentElement;
    while (p) {
      if (p instanceof JsonElement) {
        return p;
      }
      p = p.parentElement;
    }
    throw new Error('no parent Json Element found');
  }

  private initialize(
    renderer: Renderer,
    value: JsonValue,
    metadata: Metadata,
    path: JsPath,
  ): void {
    this.rendererKey = getRendererKey(value.tag, metadata, path);
    this.renderedElement = renderer.render({
      key: this.rendererKey,
      value,
      metadata,
      path,
    });
    this.path = path;
    this.appendChild(this.renderedElement);
  }

  private getType(): JsonValue['tag'] {
    if (this.renderedElement instanceof StringElement) {
      return 'jv-string';
    } else if (this.renderedElement instanceof BooleanElement) {
      return 'jv-boolean';
    } else if (this.renderedElement instanceof NumberElement) {
      return 'jv-number';
    } else if (this.renderedElement instanceof ArrayElement) {
      return 'jv-array';
    } else if (this.renderedElement instanceof ObjectElement) {
      return 'jv-object';
    } else if (this.renderedElement instanceof NullElement) {
      return 'jv-null';
    }
    throw new Error('unhandled element ' + this.renderedElement);
  }

  setMetadata(metadata: Metadata, path: JsPath, renderer: Renderer) {
    this.path = path;
    const newKey = getRendererKey(this.getType(), metadata, path);
    if (this.rendererKey !== undefined && !newKey.equals(this.rendererKey)) {
      const value = this.toValue();
      this.renderedElement?.remove();
      this.renderedElement = renderer.render({
        key: newKey,
        value,
        metadata,
        path,
      });
      this.rendererKey = newKey;
      this.appendChild(this.renderedElement);
    } else {
      this.renderedElement?.setMetadata(metadata, path, renderer);
    }
  }

  toValue(): JsonValue {
    if (this.renderedElement instanceof StringElement) {
      return jvString(this.renderedElement.getStrValue());
    } else if (this.renderedElement instanceof BooleanElement) {
      return jvBool(this.renderedElement.getBooleanValue());
    } else if (this.renderedElement instanceof NumberElement) {
      return jvNumber(this.renderedElement.getNumValue());
    } else if (this.renderedElement instanceof ArrayElement) {
      return jvArray(
        this.renderedElement.getElements().map((e) => e.toValue()),
      );
    } else if (this.renderedElement instanceof ObjectElement) {
      return jvObject(
        this.renderedElement
          .getProperties()
          .map(([name, elem]) => ({ name, value: elem.toValue() })),
      );
    } else if (this.renderedElement instanceof ObjectElement) {
      return jvNull;
    } else {
      throw new Error('unhandled element ' + this.renderedElement);
    }
  }

  addPropertyOrElement() {
    if (this.renderedElement instanceof ArrayElement) {
      this.renderedElement.appendItem();
    } else if (this.renderedElement instanceof ObjectElement) {
      this.renderedElement.appendProperty();
    }
  }

  set path(p: JsPath) {
    this.setAttribute('path', p.format());
  }

  get path(): JsPath {
    const pathStr = this.getAttribute('path');
    if (pathStr === null) {
      throw new Error('path attribute not found');
    }
    return JsPath.parse(pathStr);
  }
}

customElements.define(JsonElement.TAG_NAME, JsonElement);
