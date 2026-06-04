import {
  JsonValue,
  JsPath,
  Metadata,
  SchemaRenderer,
  stringify,
} from '@diesel-parser/json-form';
import { stringArrayEquals } from './stringArrayEquals';
import { map2 } from 'tea-cup-fp';
import { CarbonStringElemBasic } from './carbon/CarbonStringElemBasic';
import { CarbonNullElement } from './carbon/CarbonNullElem';
import { CarbonBooleanElement } from './carbon/CarbonBooleanElem';
import { CarbonNumberElement } from './carbon/CarbonNumberElem';
import { CarbonArrayElement } from './carbon/CarbonArrayElem';
import { CarbonObjectElement } from './carbon/CarbonObjectElem';
import { StringElement } from './StringElement';
import { CarbonStringElemDate } from './carbon/CarbonStringElemDate';
import { CarbonStringElemTime } from './carbon/CarbonStringElemTime';
import { CarbonStringElemDateTime } from './carbon/CarbonStringElemDateTime';
import { CarbonStringElemCombo } from './carbon/CarbonStringElemCombo';
import { RenderedElement } from './RenderedElement';

export interface RenderArgs {
  readonly value: JsonValue;
  readonly metadata: Metadata;
  readonly path: JsPath;
}

type CustomRendererCtor = (s: SchemaRenderer) => RenderedElement<JsonValue>;

type FormatCtor = () => StringElement;

export class Renderer {
  private readonly customRenderers: Map<string, CustomRendererCtor> = new Map();
  private readonly formatRenderers: Map<string, FormatCtor> = new Map<
    string,
    FormatCtor
  >([
    ['date', () => new CarbonStringElemDate()],
    ['time', () => new CarbonStringElemTime()],
    ['date-time', () => new CarbonStringElemDateTime()],
  ]);

  addCustomRenderer(
    customKey: string,
    f: (s: SchemaRenderer) => RenderedElement<JsonValue>,
  ) {
    this.customRenderers.set(customKey, f);
  }

  private createCustom(
    key: CustomRendererKey,
    args: RenderArgs,
    f: CustomRendererCtor,
  ): RenderedElement<JsonValue> {
    const e = f(key.customKey);
    return e;
  }

  private createString(
    value: string,
    args: RenderArgs,
  ): RenderedElement<JsonValue> {
    const { path, metadata } = args;
    const pathStr = path.format();

    const combos = metadata.comboBoxes.get(pathStr);
    if (combos && combos.length > 0) {
      return new CarbonStringElemCombo();
    }

    const formats = metadata.formats.get(pathStr);
    if (formats && formats.length > 0) {
      const fmt = formats[0];
      const ctor = this.formatRenderers.get(fmt);
      if (ctor) {
        return ctor();
      }
    }

    return document.createElement(
      CarbonStringElemBasic.TAG_NAME,
    ) as CarbonStringElemBasic;
  }

  private createDefault(args: RenderArgs): RenderedElement<JsonValue> {
    switch (args.value.tag) {
      case 'jv-null': {
        return document.createElement(
          CarbonNullElement.TAG_NAME,
        ) as CarbonNullElement;
      }
      case 'jv-string': {
        return this.createString(args.value.value, args);
      }
      case 'jv-boolean': {
        return document.createElement(
          CarbonBooleanElement.TAG_NAME,
        ) as CarbonBooleanElement;
      }
      case 'jv-number': {
        return document.createElement(
          CarbonNumberElement.TAG_NAME,
        ) as CarbonNumberElement;
      }
      case 'jv-array': {
        return document.createElement(
          CarbonArrayElement.TAG_NAME,
        ) as CarbonArrayElement;
      }
      case 'jv-object': {
        return document.createElement(
          CarbonObjectElement.TAG_NAME,
        ) as CarbonObjectElement;
      }
    }
  }

  render(args: RenderArgs): RenderedElement<JsonValue> {
    const key = getRendererKey(args.value.tag, args.metadata, args.path);
    const e = this.create(key, args);
    e.path = JsPath.empty;
    e.rendererKey = key;
    e.initialize(args.value, args.metadata, JsPath.empty, this);
    return e;
  }

  private create(
    key: RendererKey,
    args: RenderArgs,
  ): RenderedElement<JsonValue> {
    if (key instanceof CustomRendererKey) {
      const f = this.customRenderers.get(key.customKey.key);
      if (f) {
        return this.createCustom(key, args, f);
      } else {
        console.warn('custom renderer not found : ' + key.customKey.key);
        return this.createDefault(args);
      }
    } else if (key instanceof StringRendererKey) {
      if (args.value.tag === 'jv-string') {
        return this.createString(args.value.value, args);
      } else {
        throw "key and type don't match " + key + ', ' + args.value.tag;
      }
    } else if (key instanceof DefaultRendererKey) {
      return this.createDefault(args);
    }
    throw 'Unhandled key ' + key;
  }
}

export abstract class RendererKey {
  abstract equals(other: RendererKey): boolean;
}

class DefaultRendererKey extends RendererKey {
  constructor(readonly type: JsonValue['tag']) {
    super();
  }

  equals(other: RendererKey): boolean {
    if (other instanceof DefaultRendererKey) {
      return this.type === other.type;
    } else {
      return false;
    }
  }
}

class StringRendererKey extends RendererKey {
  constructor(readonly formats: readonly string[]) {
    super();
  }

  equals(other: RendererKey): boolean {
    if (other instanceof StringRendererKey) {
      return stringArrayEquals(this.formats, other.formats);
    } else {
      return false;
    }
  }
}

class CustomRendererKey extends RendererKey {
  constructor(readonly customKey: SchemaRenderer) {
    super();
  }

  equals(other: RendererKey): boolean {
    if (other instanceof CustomRendererKey) {
      const s1 = stringify(this.customKey.schemaValue);
      const s2 = stringify(other.customKey.schemaValue);
      return map2(s1, s2, (k1, k2) => k1 === k2).withDefault(false);
    } else {
      return false;
    }
  }
}

export function getRendererKey(
  type: JsonValue['tag'],
  metadata: Metadata,
  path: JsPath,
): RendererKey {
  const pathStr = path.format();
  const customRenderer = metadata.renderers.get(pathStr);
  if (customRenderer) {
    return new CustomRendererKey(customRenderer);
  }
  if (type === 'jv-string') {
    const formats = metadata.formats.get(pathStr);
    if (formats !== undefined) {
      return new StringRendererKey(formats);
    }
  }
  return new DefaultRendererKey(type);
}
