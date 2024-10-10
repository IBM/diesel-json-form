import {
  JsonValue,
  JvArray,
  JvBoolean,
  JvNull,
  JvNumber,
  JvObject,
  JvString,
} from '@diesel-parser/json-form';
import { JsonValueElement } from './JsonValueElement';
import { RendererArgs } from './RendererArgs';
import { JsonStringElement } from './elements/JsonStringElement';
import { JsonNumberElement } from './elements/JsonNumberElement';
import { JsonBooleanElement } from './elements/JsonBooleanElement';
import { JsonObjectElement } from './elements/JsonObjectElement';
import { JsonArrayElement } from './elements/JsonArrayElement';
import { JsonNullElement } from './elements/JsonNullElement';
import { JsRenderer } from '@diesel-parser/json-schema-facade-ts';

export type ElementFactory<T extends JsonValue> = (
  schemaValue: any,
  args: RendererArgs<T>,
) => JsonValueElement<T> & HTMLElement;

export class Renderer {
  private _registry: Map<string, ElementFactory<JsonValue>> = new Map();

  render(
    args: RendererArgs<JsonValue>,
  ): JsonValueElement<JsonValue> & HTMLElement {
    const e = this.createElement(args);
    e.render(args);
    return e;
  }

  protected createElement(
    args: RendererArgs<JsonValue>,
  ): JsonValueElement<JsonValue> & HTMLElement {
    const { schemaInfos, path } = args;
    const renderer = schemaInfos.getRenderer(path);
    if (renderer) {
      const e = this.createElementRenderer(renderer, args);
      if (e) {
        return e;
      } else {
        console.warn('no renderer found for key:' + renderer.key);
        return this.createElementByType(args);
      }
    } else {
      return this.createElementByType(args);
    }
  }

  private createElementByType(
    args: RendererArgs<JsonValue>,
  ): JsonValueElement<JsonValue> & HTMLElement {
    const { value } = args;
    switch (value.tag) {
      case 'jv-string': {
        return this.createElementString(args);
      }
      case 'jv-number': {
        return this.createElementNumber(args);
      }
      case 'jv-boolean': {
        return this.createElementBoolean(args);
      }
      case 'jv-object': {
        return this.createElementObject(args);
      }
      case 'jv-array': {
        return this.createElementArray(args);
      }
      case 'jv-null': {
        return this.createElementNull(args);
      }
    }
  }

  private createElementRenderer(
    renderer: JsRenderer,
    args: RendererArgs<JsonValue>,
  ): (JsonValueElement<JsonValue> & HTMLElement) | undefined {
    const r = this._registry.get(renderer.key);
    if (r) {
      return r(renderer.schemaValue, args);
    } else {
      return undefined;
    }
  }

  protected createElementString(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    args: RendererArgs<JsonValue>,
  ): JsonValueElement<JvString> & HTMLElement {
    return JsonStringElement.newInstance();
  }

  protected createElementNumber(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    args: RendererArgs<JsonValue>,
  ): JsonValueElement<JvNumber> & HTMLElement {
    return JsonNumberElement.newInstance();
  }

  protected createElementBoolean(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    args: RendererArgs<JsonValue>,
  ): JsonValueElement<JvBoolean> & HTMLElement {
    return JsonBooleanElement.newInstance();
  }

  protected createElementObject(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    args: RendererArgs<JsonValue>,
  ): JsonValueElement<JvObject> & HTMLElement {
    return JsonObjectElement.newInstance();
  }

  protected createElementArray(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    args: RendererArgs<JsonValue>,
  ): JsonValueElement<JvArray> & HTMLElement {
    return JsonArrayElement.newInstance();
  }

  protected createElementNull(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    args: RendererArgs<JsonValue>,
  ): JsonValueElement<JvNull> & HTMLElement {
    return JsonNullElement.newInstance();
  }
}
