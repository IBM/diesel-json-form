import { stringArrayEquals } from './stringArrayEquals.js';
import { map2 } from 'tea-cup-fp';
import { StringElement } from './StringElement.js';
import { RenderedElement } from './RenderedElement.js';
import { JsonValue, stringify } from '../JsonValue.js';
import { SchemaRenderer } from '../SchemaService.js';
import { Metadata } from '../Metadata.js';
import { JsPath } from '../JsPath.js';

export interface RenderArgs {
  readonly value: JsonValue;
  readonly metadata: Metadata;
  readonly path: JsPath;
}

type CustomRendererCtor = (s: SchemaRenderer) => RenderedElement<JsonValue>;

type FormatCtor = () => StringElement;
type DefaultCtor = () => RenderedElement<JsonValue>;

export class Renderer {
  private comboRenderer?: DefaultCtor;
  private readonly customRenderers: Map<string, CustomRendererCtor> = new Map();
  private readonly formatRenderers: Map<string, FormatCtor> = new Map();
  private readonly defaultRenderers: Map<JsonValue['tag'], DefaultCtor> =
    new Map();

  addCustomRenderer(
    customKey: string,
    f: (s: SchemaRenderer) => RenderedElement<JsonValue>,
  ) {
    this.customRenderers.set(customKey, f);
  }

  addStringFormatRenderer(format: string, f: FormatCtor) {
    this.formatRenderers.set(format, f);
  }

  addDefaultRenderer(tag: JsonValue['tag'], f: DefaultCtor) {
    this.defaultRenderers.set(tag, f);
  }

  setStringComboRenderer(r: DefaultCtor) {
    this.comboRenderer = r;
  }

  private createCustom(
    key: CustomRendererKey,
    args: RenderArgs,
    f: CustomRendererCtor,
  ): RenderedElement<JsonValue> {
    const e = f(key.customKey);
    if (e.getType() === args.value.tag) {
      return e;
    } else {
      console.warn(
        `custom renderer ${key.customKey.key} found of type ${e.getType()}, but doesn't match value type ${args.value.tag}`,
      );
      return this.createDefault(args);
    }
  }

  private createString(
    value: string,
    args: RenderArgs,
  ): RenderedElement<JsonValue> {
    const { path, metadata } = args;
    const pathStr = path.format();

    const formats = metadata.formats.get(pathStr);
    if (formats && formats.length > 0) {
      const fmt = formats[0];
      const ctor = this.formatRenderers.get(fmt);
      if (ctor) {
        return ctor();
      }
    }

    const combos = metadata.comboBoxes.get(pathStr);
    if (combos && combos.length > 0 && this.comboRenderer) {
      return this.comboRenderer();
    }

    const r = this.defaultRenderers.get('jv-string');
    if (r) {
      return r();
    }

    throw new Error('no renderer found for default string');
  }

  private createDefault(args: RenderArgs): RenderedElement<JsonValue> {
    const ctor = this.defaultRenderers.get(args.value.tag);
    if (!ctor) {
      throw new Error('no renderer found for type ' + args.value.tag);
    }
    return ctor();
  }

  render(args: RenderArgs): RenderedElement<JsonValue> {
    const key = getRendererKey(args.value.tag, args.metadata, args.path);
    const e = this.create(key, args);
    e.path = args.path;
    e.rendererKey = key;
    e.initialize(args.value, args.metadata, args.path, this);
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
