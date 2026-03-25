import {
  JsonValue,
  JsPath,
  JvArray,
  JvBoolean,
  JvNull,
  JvNumber,
  JvObject,
  JvString,
} from '@diesel-parser/json-form';
import { JsonValueElement } from './JsonValueElement';
import { RenderConfig } from './RendererConfig';
import { JsonStringElement } from './elements/JsonStringElement';
import { JsonNumberElement } from './elements/JsonNumberElement';
import { JsonBooleanElement } from './elements/JsonBooleanElement';
import { JsonObjectElement } from './elements/JsonObjectElement';
import { JsonArrayElement } from './elements/JsonArrayElement';
import { JsonNullElement } from './elements/JsonNullElement';
import { JsRenderer } from '@diesel-parser/json-schema-facade-ts';

export type ElementFactory<T extends JsonValue> = (
  schemaValue: JsonValue,
  config: RenderConfig,
  path: JsPath,
  value: T,
) => JsonValueElement<T> & HTMLElement;

export class Renderer {
  private _registry: Map<string, ElementFactory<JsonValue>> = new Map();

  render(
    config: RenderConfig,
    path: JsPath,
    value: JsonValue,
  ): JsonValueElement<JsonValue> & HTMLElement {
    const e = this.createElement(config, path, value);
    e.render(config, path, value);
    return e;
  }

  protected createElement(
    config: RenderConfig,
    path: JsPath,
    value: JsonValue,
  ): JsonValueElement<JsonValue> & HTMLElement {
    const { schemaInfos } = config;
    const renderer = schemaInfos.getRenderer(path);
    if (renderer) {
      const e = this.createElementRenderer(renderer, config, path, value);
      if (e) {
        return e;
      } else {
        console.warn('no renderer found for key:' + renderer.key);
        return this.createElementByType(value);
      }
    } else {
      return this.createElementByType(value);
    }
  }

  private createElementByType(
    value: JsonValue,
  ): JsonValueElement<JsonValue> & HTMLElement {
    switch (value.tag) {
      case 'jv-string': {
        return this.createElementString();
      }
      case 'jv-number': {
        return this.createElementNumber();
      }
      case 'jv-boolean': {
        return this.createElementBoolean();
      }
      case 'jv-object': {
        return this.createElementObject();
      }
      case 'jv-array': {
        return this.createElementArray();
      }
      case 'jv-null': {
        return this.createElementNull();
      }
    }
  }

  private createElementRenderer(
    renderer: JsRenderer,
    config: RenderConfig,
    path: JsPath,
    value: JsonValue,
  ): (JsonValueElement<JsonValue> & HTMLElement) | undefined {
    const r = this._registry.get(renderer.key);
    if (r) {
      return r(renderer.schemaValue, config, path, value);
    } else {
      return undefined;
    }
  }

  protected createElementString(): JsonValueElement<JvString> & HTMLElement {
    return JsonStringElement.newInstance();
  }

  protected createElementNumber(): JsonValueElement<JvNumber> & HTMLElement {
    return JsonNumberElement.newInstance();
  }

  protected createElementBoolean(): JsonValueElement<JvBoolean> & HTMLElement {
    return JsonBooleanElement.newInstance();
  }

  protected createElementObject(): JsonValueElement<JvObject> & HTMLElement {
    return JsonObjectElement.newInstance();
  }

  protected createElementArray(): JsonValueElement<JvArray> & HTMLElement {
    return JsonArrayElement.newInstance();
  }

  protected createElementNull(): JsonValueElement<JvNull> & HTMLElement {
    return JsonNullElement.newInstance();
  }
}
